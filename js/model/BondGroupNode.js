//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Displays a thumbnail of the bond type (single, double, triple) or lone pair, along with a red 'X' for removal.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
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
  * Dynamic generation of the bonding/lone-pair panel images
  *----------------------------------------------------------------------------*/
  var scene = new THREE.Scene();
  MoleculeShapesScreenView.addLightsToScene( scene );

  var renderer = MoleculeShapesGlobals.useWebGL ? new THREE.WebGLRenderer( {
      antialias: true,
      preserveDrawingBuffer: true, // so we can toDataURL() it
      alpha: true // so we can render the transparency
    } ) : new THREE.CanvasRenderer();
  renderer.setClearColor( 0x0, 0 ); // transparent

  var devicePixelRatio = window.devicePixelRatio || 1;

  var camera = new THREE.OrthographicCamera();
  camera.position.set( 0, 0, 40 );
  camera.near = 1; // near clipping plane
  camera.far = 100; // far clipping plane

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

    return renderer.domElement.toDataURL();
  }

  var imageScale = 3;
  var lonePairWidth = 78;
  var atomHeight = 42;
  var atomWidth = 120;
  var lonePairHeight = 55;
  function getBondDataURL( bondOrder ) {
    var molecule = new VSEPRMolecule();
    var centralAtom = new PairGroup( new Vector3(), false );
    molecule.addCentralAtom( centralAtom );
    molecule.addGroupAndBond( new PairGroup( Vector3.X_UNIT.times( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ), bondOrder === 0 ), centralAtom, bondOrder );
    var model = new MoleculeShapesModel( false, {
      molecule: molecule
    } );

    var view = new MoleculeView( model, MoleculeShapesScreenView.createAPIStub(), molecule, { showLabel: function() {}, finishedAddingLabels: function() {} } );
    view.updateView();
    view.hideCentralAtom();

    var orthoSize = bondOrder === 0 ?
                    ( PairGroup.LONE_PAIR_DISTANCE * 1.07 ):
                    ( PairGroup.BONDED_PAIR_DISTANCE * 1.22 );
    var url = render( view, ( bondOrder === 0 ? lonePairWidth : atomWidth ) * imageScale, ( bondOrder === 0 ? lonePairHeight : atomHeight ) * imageScale, orthoSize );
    view.dispose();
    return url;
  }

  function BondGroupNode( model, bondOrder, addPairCallback, removePairCallback, options ) {
    this.model = model;
    this.bondOrder = bondOrder;

    var addEnabled = true;

    var overlay = new Rectangle( 0, 0, 120, bondOrder !== 0 ? atomHeight : lonePairHeight, 0, 0, options );
    overlay.addInputListener( {
      down: function() {
        if ( addEnabled ) {
          addPairCallback( bondOrder, overlay.localToGlobalBounds( overlay.localBounds ) );
        }
      }
    } );
    overlay.touchArea = overlay.localBounds.dilatedY( 4 ).withMinX( -10 );
    var image = new Image( getBondDataURL( bondOrder ), {
      scale: 1 / imageScale / devicePixelRatio // retina devices create large images, so for now we normalize the image scale
    } );
    // override local bounds because the correct bounds may not be loaded yet
    image.localBounds = bondOrder === 0 ?
                        new Bounds2( 0, 0, lonePairWidth * devicePixelRatio * imageScale, lonePairHeight * devicePixelRatio * imageScale ) :
                        new Bounds2( 0, 0, atomWidth * devicePixelRatio * imageScale, atomHeight * devicePixelRatio * imageScale );
    image.center = overlay.center;

    // handle updates to our color scheme by recreating the images needed
    function updateImage() {
      image.image = getBondDataURL( bondOrder );
    }
    if ( bondOrder === 0 ) {
      MoleculeShapesColors.lonePairShellProperty.lazyLink( updateImage );
      MoleculeShapesColors.lonePairElectronProperty.lazyLink( updateImage );
    } else {
      MoleculeShapesColors.atomProperty.lazyLink( updateImage );
      MoleculeShapesColors.bondProperty.lazyLink( updateImage );
    }

    // move the lone pair over to the right more, so that it looks more centered
    if ( bondOrder === 0 ) {
      image.right = overlay.right - 10;
    }

    var thumbnail = new Node( { children: [image, overlay] } );
    var removeButton = new RemovePairGroupButton( {
      listener: function() {
        removePairCallback( bondOrder );
      }
    } );
    removeButton.touchArea = removeButton.localBounds.dilatedY( 14 ).withMinX( removeButton.localBounds.minX - 10 ).withMaxX( removeButton.localBounds.maxX + 20 );
    function update() {
      addEnabled = model.molecule.wouldAllowBondOrder( bondOrder );
      if ( bondOrder === 0 ) {
        addEnabled = addEnabled && model.showLonePairs;
      }
      overlay.cursor = addEnabled ? 'pointer' : null;

      overlay.fill = addEnabled ? 'rgba(0,0,0,0)' : MoleculeShapesColors.background.withAlpha( 0.4 );
      removeButton.visible = _.filter( model.molecule.getBondsAround( model.molecule.centralAtom ), function( bond ) {
        return bond.order === bondOrder;
      } ).length > 0;
    }
    model.molecule.on( 'bondChanged', update );
    model.link( 'showLonePairs', update );
    MoleculeShapesColors.backgroundProperty.lazyLink( update );

    HBox.call( this, _.extend( {
      children: [thumbnail, removeButton],
      spacing: 10,
      align: 'center'
    }, options ) );
  }

  return inherit( HBox, BondGroupNode, {} );
} );

