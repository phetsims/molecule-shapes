// Copyright 2014-2015, University of Colorado Boulder

/**
 * Displays a thumbnail of the bond type (single, double, triple) or lone pair, along with a red 'X' for removal.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var platform = require( 'PHET_CORE/platform' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector3 = require( 'DOT/Vector3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/common/model/MoleculeShapesModel' );
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var RemovePairGroupButton = require( 'MOLECULE_SHAPES/model/RemovePairGroupButton' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );

  /*---------------------------------------------------------------------------*
   * Dynamic generation of the bonding/lone-pair panel images, by rendering a three.js scene to an image
   *----------------------------------------------------------------------------*/
  var scene = new THREE.Scene();
  MoleculeShapesScreenView.addLightsToScene( scene );

  var renderer = MoleculeShapesGlobals.useWebGL ? new THREE.WebGLRenderer( {
    antialias: true,
    preserveDrawingBuffer: true, // so we can toDataURL() it
    alpha: true // so we can render the transparency
  } ) : new THREE.CanvasRenderer();
  renderer.setClearColor( 0x0, 0 ); // transparent

  var camera = new THREE.OrthographicCamera();
  camera.position.set( 0, 0, 40 );
  camera.near = 1; // near clipping plane
  camera.far = 100; // far clipping plane

  // @param {number} orthoSize - The width of the orthographic camera's viewport in the world coordinate frame
  function render( view, width, height, orthoSize ) {
    scene.add( view );
    camera.left = 0;
    camera.right = orthoSize;
    camera.top = orthoSize * height / width / 2; // the corresponding height given the orthoSize => width scaling
    camera.bottom = -orthoSize * height / width / 2;
    camera.updateProjectionMatrix(); // three.js requires this to be called after changing the parameters

    renderer.setSize( width, height );
    renderer.render( scene, camera );
    scene.remove( view );

    return renderer.domElement;
  }

  // tuned parameters to match the desired Canvas sizes for lone pairs and atom bonds
  var IMAGE_SCALE = 3;
  var LONE_PAIR_WIDTH = 78;
  var ATOM_HEIGHT = 42;
  var ATOM_WIDTH = 120;
  var LONE_PAIR_HEIGHT = 55;

  // Returns a {string} URL OR a mipmap {object}, both of which are compatible with Scenery's Image
  function getBondDataURL( bondOrder ) {
    var molecule = new VSEPRMolecule();
    var centralAtom = new PairGroup( new Vector3(), false );
    molecule.addCentralAtom( centralAtom );
    molecule.addGroupAndBond( new PairGroup( Vector3.X_UNIT.times( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ), bondOrder === 0 ), centralAtom, bondOrder );
    var model = new MoleculeShapesModel( false, {
      molecule: molecule
    } );

    var view = new MoleculeView( model, MoleculeShapesScreenView.createAPIStub( renderer ), molecule, {
      showLabel: function() {},
      finishedAddingLabels: function() {}
    } );
    view.updateView();
    view.hideCentralAtom();

    var orthoSize = bondOrder === 0 ?
                    ( PairGroup.LONE_PAIR_DISTANCE * 1.07 ) :
                    ( PairGroup.BONDED_PAIR_DISTANCE * 1.22 );
    var width = ( bondOrder === 0 ? LONE_PAIR_WIDTH : ATOM_WIDTH ) * IMAGE_SCALE;
    var height = ( bondOrder === 0 ? LONE_PAIR_HEIGHT : ATOM_HEIGHT ) * IMAGE_SCALE;
    var baseCanvas = render( view, width, height, orthoSize );
    var url = baseCanvas.toDataURL();
    view.dispose();

    if ( platform.firefox ) {
      // Create a mipmap for firefox, see https://github.com/phetsims/molecule-shapes/issues/129
      url = Image.createFastMipmapFromCanvas( baseCanvas );
    }
    return url;
  }

  function BondGroupNode( model, bondOrder, addPairCallback, removePairCallback, options ) {
    this.model = model;
    this.bondOrder = bondOrder;

    // whether our "button" is enabled
    var enabled = true;

    // how many pointers are over our node, used for changing the highlighting for the "button over"
    var overCount = 0;

    // A semi-transparent overlay with the same color as the background (and variable alpha). Used to adjust the visual
    // "opacity" of the underlying image (by toggling our alpha), and as a hit-area for events.
    var overlay = new Rectangle( 0, 0, 120, bondOrder !== 0 ? ATOM_HEIGHT : LONE_PAIR_HEIGHT, 0, 0, options );
    overlay.addInputListener( {
      down: function() {
        if ( enabled ) {
          addPairCallback( bondOrder, overlay.localToGlobalBounds( overlay.localBounds ) );
        }
      },
      enter: function() {
        overCount++;
        updateOverlayOpacity();
      },
      exit: function() {
        overCount--;
        updateOverlayOpacity();
      }
    } );
    overlay.touchArea = overlay.localBounds.dilatedY( 4 ).withMinX( -10 );

    // our image of the lone pair / bond, under the overlay.
    var image = new Image( getBondDataURL( bondOrder ), {
      scale: 1 / IMAGE_SCALE // retina devices create large images, so for now we normalize the image scale
    } );
    // override local bounds because the correct bounds may not be loaded yet (loading from a data URL, not an HTMLImageElement)
    image.localBounds = bondOrder === 0 ?
                        new Bounds2( 0, 0, LONE_PAIR_WIDTH * IMAGE_SCALE, LONE_PAIR_HEIGHT * IMAGE_SCALE ) :
                        new Bounds2( 0, 0, ATOM_WIDTH * IMAGE_SCALE, ATOM_HEIGHT * IMAGE_SCALE );
    image.center = overlay.center;

    // handle updates to our color scheme by recreating the images needed
    function updateImage() {
      image.image = getBondDataURL( bondOrder );
    }

    if ( bondOrder === 0 ) {
      MoleculeShapesColors.lonePairShellProperty.lazyLink( updateImage );
      MoleculeShapesColors.lonePairElectronProperty.lazyLink( updateImage );
    }
    else {
      MoleculeShapesColors.atomProperty.lazyLink( updateImage );
      MoleculeShapesColors.bondProperty.lazyLink( updateImage );
    }

    // move the lone pair over to the right more, so that it looks more centered
    if ( bondOrder === 0 ) {
      image.right = overlay.right - 10;
    }

    var thumbnail = new Node( { children: [ image, overlay ] } );

    // button to remove a copy of the bond / lone pair
    var removeButton = new RemovePairGroupButton( {
      listener: function() {
        removePairCallback( bondOrder );
      }
    } );
    removeButton.touchArea = removeButton.localBounds.dilatedY( 14 ).withMinX( removeButton.localBounds.minX - 10 ).withMaxX( removeButton.localBounds.maxX + 20 );

    // updates the visual state of the thumbnail (image/overlay) and removal button
    function update() {
      enabled = model.molecule.wouldAllowBondOrder( bondOrder );
      if ( bondOrder === 0 ) {
        enabled = enabled && model.showLonePairs;
      }
      overlay.cursor = enabled ? 'pointer' : null;

      removeButton.visible = _.filter( model.molecule.getBondsAround( model.molecule.centralAtom ), function( bond ) {
        return bond.order === bondOrder;
      } ).length > 0;

      updateOverlayOpacity();
    }

    function updateOverlayOpacity() {
      var alpha;
      if ( enabled ) {
        // when "button over" the overlay will show through more of the image
        alpha = overCount > 0 ? 0 : 0.1;
      }
      else {
        alpha = 0.4;
      }
      overlay.fill = MoleculeShapesColors.background.withAlpha( alpha );
    }

    model.molecule.on( 'bondChanged', update );
    model.link( 'showLonePairs', update );
    MoleculeShapesColors.backgroundProperty.lazyLink( update );

    HBox.call( this, _.extend( {
      children: [ thumbnail, removeButton ],
      spacing: 10,
      align: 'center'
    }, options ) );
  }

  return inherit( HBox, BondGroupNode );
} );

