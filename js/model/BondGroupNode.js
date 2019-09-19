// Copyright 2014-2019, University of Colorado Boulder

/**
 * Displays a thumbnail of the bond type (single, double, triple) or lone pair, along with a red 'X' for removal.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  const MoleculeShapesModel = require( 'MOLECULE_SHAPES/common/model/MoleculeShapesModel' );
  const MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  const MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  const platform = require( 'PHET_CORE/platform' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RemovePairGroupButton = require( 'MOLECULE_SHAPES/model/RemovePairGroupButton' );
  const Vector3 = require( 'DOT/Vector3' );
  const VSEPRMolecule = require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' );

  /*---------------------------------------------------------------------------*
   * Dynamic generation of the bonding/lone-pair panel images, by rendering a three.js scene to an image
   *----------------------------------------------------------------------------*/
  const scene = new THREE.Scene();
  MoleculeShapesScreenView.addLightsToScene( scene );

  const renderer = MoleculeShapesGlobals.useWebGLProperty.get() ? new THREE.WebGLRenderer( {
    antialias: true,
    preserveDrawingBuffer: true, // so we can toDataURL() it
    alpha: true // so we can render the transparency
  } ) : new THREE.CanvasRenderer();
  MoleculeShapesColorProfile.backgroundProperty.link( color => renderer.setClearColor( color.toNumber(), 1 ) );

  const camera = new THREE.OrthographicCamera();
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
  const IMAGE_SCALE = 3;
  const LONE_PAIR_WIDTH = 78;
  const ATOM_HEIGHT = 42;
  const ATOM_WIDTH = 120;
  const LONE_PAIR_HEIGHT = 55;

  // Returns a {string} URL OR a mipmap {Object}, both of which are compatible with Scenery's Image
  function getBondDataURL( bondOrder ) {
    const molecule = new VSEPRMolecule();
    const centralAtom = new PairGroup( new Vector3( 0, 0, 0 ), false );
    molecule.addCentralAtom( centralAtom );
    molecule.addGroupAndBond( new PairGroup( Vector3.X_UNIT.times( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ), bondOrder === 0 ), centralAtom, bondOrder );
    const model = new MoleculeShapesModel( false, {
      molecule: molecule
    } );

    const view = new MoleculeView( model, MoleculeShapesScreenView.createAPIStub( renderer ), molecule, {
      showLabel: function() {},
      finishedAddingLabels: function() {}
    } );
    view.updateView();
    view.hideCentralAtom();

    const orthoSize = bondOrder === 0 ?
                    ( PairGroup.LONE_PAIR_DISTANCE * 1.07 ) :
                    ( PairGroup.BONDED_PAIR_DISTANCE * 1.22 );
    const width = ( bondOrder === 0 ? LONE_PAIR_WIDTH : ATOM_WIDTH ) * IMAGE_SCALE;
    const height = ( bondOrder === 0 ? LONE_PAIR_HEIGHT : ATOM_HEIGHT ) * IMAGE_SCALE;
    const baseCanvas = render( view, width, height, orthoSize );
    let url = baseCanvas.toDataURL();
    view.dispose();

    if ( platform.firefox ) {
      // Create a Canvas copy if we are going to keep a reference to the Canvas
      const canvasCopy = document.createElement( 'canvas' );
      const contextCopy = canvasCopy.getContext( '2d' );
      canvasCopy.width = baseCanvas.width;
      canvasCopy.height = baseCanvas.height;
      contextCopy.drawImage( baseCanvas, 0, 0 );

      // Create a mipmap for firefox, see https://github.com/phetsims/molecule-shapes/issues/129
      url = Image.createFastMipmapFromCanvas( canvasCopy );
    }
    return url;
  }

  /**
   * @constructor
   *
   * @param {MoleculeShapesModel} model
   * @param {number} bondOrder
   * @param {Function} addPairCallback - Will be called when the user clicks on the main part (add) of this component.
   * @param {Function} removePairCallback - Will be called when the user clicks on the remove button in this.
   * @param {Object} [options]
   */
  function BondGroupNode( model, bondOrder, addPairCallback, removePairCallback, options ) {
    this.model = model; // @private {MoleculeShapesModel}
    this.bondOrder = bondOrder; // @private {number}

    // whether our "button" is enabled
    let enabled = true;

    // how many pointers are over our node, used for changing the highlighting for the "button over"
    let overCount = 0;

    // A semi-transparent overlay with the same color as the background (and variable alpha). Used to adjust the visual
    // "opacity" of the underlying image (by toggling our alpha), and as a hit-area for events.
    const overlay = new Rectangle( 0, 0, 120, bondOrder !== 0 ? ATOM_HEIGHT : LONE_PAIR_HEIGHT, 0, 0, options );
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
    const image = new Image( getBondDataURL( bondOrder ), {
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
      MoleculeShapesColorProfile.lonePairShellProperty.lazyLink( updateImage );
      MoleculeShapesColorProfile.lonePairElectronProperty.lazyLink( updateImage );
    }
    else {
      MoleculeShapesColorProfile.atomProperty.lazyLink( updateImage );
      MoleculeShapesColorProfile.bondProperty.lazyLink( updateImage );
    }
    MoleculeShapesColorProfile.backgroundProperty.lazyLink( updateImage );

    // move the lone pair over to the right more, so that it looks more centered
    if ( bondOrder === 0 ) {
      image.right = overlay.right - 10;
    }

    const thumbnail = new Node( { children: [ image, overlay ] } );

    // button to remove a copy of the bond / lone pair
    const removeButton = new RemovePairGroupButton( {
      listener: function() {
        removePairCallback( bondOrder );
      }
    } );
    removeButton.touchArea = removeButton.localBounds.dilatedY( 14 ).withMinX( removeButton.localBounds.minX - 10 ).withMaxX( removeButton.localBounds.maxX + 20 );

    // updates the visual state of the thumbnail (image/overlay) and removal button
    function update() {
      enabled = model.moleculeProperty.get().wouldAllowBondOrder( bondOrder );
      if ( bondOrder === 0 ) {
        enabled = enabled && model.showLonePairsProperty.get();
      }
      overlay.cursor = enabled ? 'pointer' : null;

      removeButton.visible = _.filter( model.moleculeProperty.get().getBondsAround( model.moleculeProperty.get().centralAtom ), function( bond ) {
        return bond.order === bondOrder;
      } ).length > 0;

      updateOverlayOpacity();
    }

    function updateOverlayOpacity() {
      let alpha;
      if ( enabled ) {
        // when "button over" the overlay will show through more of the image
        alpha = overCount > 0 ? 0 : 0.1;
      }
      else {
        alpha = 0.4;
      }
      overlay.fill = MoleculeShapesColorProfile.backgroundProperty.get().withAlpha( alpha );
    }

    model.moleculeProperty.get().on( 'bondChanged', update );
    model.showLonePairsProperty.link( update );

    MoleculeShapesColorProfile.backgroundProperty.lazyLink( update );

    HBox.call( this, _.extend( {
      children: [ thumbnail, removeButton ],
      spacing: 10,
      align: 'center'
    }, options ) );
  }

  moleculeShapes.register( 'BondGroupNode', BondGroupNode );

  return inherit( HBox, BondGroupNode );
} );

