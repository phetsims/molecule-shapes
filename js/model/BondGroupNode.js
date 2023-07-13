// Copyright 2014-2022, University of Colorado Boulder

/**
 * Displays a thumbnail of the bond type (single, double, triple) or lone pair, along with a red 'X' for removal.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector3 from '../../../dot/js/Vector3.js';
import merge from '../../../phet-core/js/merge.js';
import platform from '../../../phet-core/js/platform.js';
import { FireListener, HBox, Image, Imageable, Node, Rectangle } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Molecule from '../common/model/Molecule.js';
import MoleculeShapesModel from '../common/model/MoleculeShapesModel.js';
import PairGroup from '../common/model/PairGroup.js';
import VSEPRMolecule from '../common/model/VSEPRMolecule.js';
import MoleculeShapesGlobals from '../common/MoleculeShapesGlobals.js';
import MoleculeView from '../common/view/3d/MoleculeView.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import MoleculeShapesScreenView from '../common/view/MoleculeShapesScreenView.js';
import moleculeShapes from '../moleculeShapes.js';
import RemovePairGroupButton from './RemovePairGroupButton.js';

/*---------------------------------------------------------------------------*
 * Dynamic generation of the bonding/lone-pair panel images, by rendering a three.js scene to an image
 *----------------------------------------------------------------------------*/
const scene = new THREE.Scene();
MoleculeShapesScreenView.addLightsToScene( scene );

const renderer = MoleculeShapesGlobals.useWebGLProperty.value ? new THREE.WebGLRenderer( {
  antialias: true,
  preserveDrawingBuffer: true, // so we can toDataURL() it
  alpha: true // so we can render the transparency
} ) : new THREE.CanvasRenderer();
MoleculeShapesColors.backgroundProperty.link( color => renderer.setClearColor( color.toNumber(), 1 ) );

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
    initialMolecule: molecule
  }, Tandem.OPT_OUT );

  const view = new MoleculeView( model, MoleculeShapesScreenView.createAPIStub( renderer ), molecule, {
    showLabel: () => {},
    finishedAddingLabels: () => {}
  }, Tandem.OPT_OUT );
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
    url = Imageable.createFastMipmapFromCanvas( canvasCopy );
  }
  return url;
}

class BondGroupNode extends HBox {
  /**
   * @param {MoleculeShapesModel} model
   * @param {number} bondOrder
   * @param {Function} addPairCallback - Will be called when the user clicks on the main part (add) of this component.
   * @param {Function} removePairCallback - Will be called when the user clicks on the remove button in this.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, bondOrder, addPairCallback, removePairCallback, tandem, options ) {
    super( {
      tandem: tandem,
      align: 'center',
      widthSizable: false
    } );

    this.model = model; // @private {MoleculeShapesModel}
    this.bondOrder = bondOrder; // @private {number}

    // whether our "button" is enabled
    let enabled = true;

    // how many pointers are over our node, used for changing the highlighting for the "button over"
    let overCount = 0;

    // A semi-transparent overlay with the same color as the background (and variable alpha). Used to adjust the visual
    // "opacity" of the underlying image (by toggling our alpha), and as a hit-area for events.
    const overlay = new Rectangle( 0, 0, 120, bondOrder !== 0 ? ATOM_HEIGHT : LONE_PAIR_HEIGHT, 0, 0, options );
    // TODO: track this with the FireListener?
    overlay.addInputListener( {
      enter: () => {
        overCount++;
        updateOverlayOpacity();
      },
      exit: () => {
        overCount--;
        updateOverlayOpacity();
      }
    } );
    overlay.addInputListener( new FireListener( {
      canStartPress: () => enabled,
      tandem: tandem.createTandem( 'fireListener' ),
      fireOnDown: true,
      fire: () => addPairCallback( bondOrder, overlay.localToGlobalBounds( overlay.localBounds ) )
    } ) );
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
      MoleculeShapesColors.lonePairShellProperty.lazyLink( updateImage );
      MoleculeShapesColors.lonePairElectronProperty.lazyLink( updateImage );
    }
    else {
      MoleculeShapesColors.atomProperty.lazyLink( updateImage );
      MoleculeShapesColors.bondProperty.lazyLink( updateImage );
    }
    MoleculeShapesColors.backgroundProperty.lazyLink( updateImage );

    // move the lone pair over to the right more, so that it looks more centered
    if ( bondOrder === 0 ) {
      image.right = overlay.right - 10;
    }

    const thumbnail = new Node( { children: [ image, overlay ] } );

    // button to remove a copy of the bond / lone pair
    const removeButton = new RemovePairGroupButton( {
      listener: () => {
        removePairCallback( bondOrder );
      },
      visiblePropertyOptions: { phetioReadOnly: true },
      enabledPropertyOptions: { phetioReadOnly: true },

      // Adjusted to match the left of the touch area of the overlay
      touchAreaXShift: 5,
      touchAreaXDilation: 15,
      touchAreaYDilation: 14,

      tandem: tandem.createTandem( 'removeButton' )
    } );

    // updates the visual state of the thumbnail (image/overlay) and removal button
    function update() {
      enabled = model.moleculeProperty.value.wouldAllowBondOrder( bondOrder );
      if ( bondOrder === 0 ) {
        enabled = enabled && model.showLonePairsProperty.value;
      }
      overlay.cursor = enabled ? 'pointer' : null;

      removeButton.visible = _.filter( model.moleculeProperty.value.getBondsAround( model.moleculeProperty.value.centralAtom ), bond => bond.order === bondOrder ).length > 0;

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
      overlay.fill = MoleculeShapesColors.backgroundProperty.value.withAlpha( alpha );
    }

    model.moleculeProperty.link( ( newMolecule, oldMolecule ) => {
      if ( oldMolecule ) {
        oldMolecule.bondChangedEmitter.removeListener( update );
      }
      if ( newMolecule ) {
        newMolecule.bondChangedEmitter.addListener( update );
      }
      update();
    } );
    model.showLonePairsProperty.link( update );
    Molecule.maxConnectionsProperty.lazyLink( update );

    MoleculeShapesColors.backgroundProperty.lazyLink( update );

    this.mutate( merge( {
      children: [ thumbnail, removeButton ],
      spacing: 10,
      align: 'center',
      excludeInvisibleChildrenFromBounds: false
    }, options ) );
  }
}

moleculeShapes.register( 'BondGroupNode', BondGroupNode );

export default BondGroupNode;