// Copyright 2014-2022, University of Colorado Boulder

/**
 * Dynamically generates the screen icons by rendering 3D scenes into an image and displaying atom labels on top.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Screen from '../../../../joist/js/Screen.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import { Image, Node, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesModel from '../model/MoleculeShapesModel.js';
import PairGroup from '../model/PairGroup.js';
import VSEPRMolecule from '../model/VSEPRMolecule.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';
import MoleculeView from './3d/MoleculeView.js';
import MoleculeShapesScreenView from './MoleculeShapesScreenView.js';

/*---------------------------------------------------------------------------*
 * Dynamic generation of the molecules
 *----------------------------------------------------------------------------*/
const scene = new THREE.Scene();
MoleculeShapesScreenView.addLightsToScene( scene );

const renderer = MoleculeShapesGlobals.useWebGLProperty.value ? new THREE.WebGLRenderer( {
  antialias: true,
  preserveDrawingBuffer: true, // so we can toDataURL() it
  alpha: true // transparency needs to be enabled, even though we don't need it here. see #98
} ) : new THREE.CanvasRenderer();

const camera = new THREE.PerspectiveCamera();

function render( view, width, height, isBasicsVersion ) {
  scene.add( view );

  // customized colors
  renderer.setClearColor( isBasicsVersion ? 0xc6e2f6 : 0x333333, 1 );

  // we want the basics version centered (CO2), but the regular version off-center (so the central atom is higher)
  camera.position.set( 0, isBasicsVersion ? 0 : -10, 200 );
  camera.fov = 25;
  camera.aspect = width / height;
  camera.near = 1;
  camera.far = 300;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );
  renderer.render( scene, camera );
  scene.remove( view );

  return renderer.domElement.toDataURL();
}

function getAngle( isModel, isBasicsVersion ) {
  if ( !isBasicsVersion ) {
    // H2O
    return isModel ? Utils.toRadians( 120 ) / 2 : Utils.toRadians( 104.5 ) / 2;
  }
  else {
    // CO2
    return Math.PI / 2;
  }
}

// since the atoms in the basics version are horizontal, we need to scale it down just a bit
function getRelativeScale( isBasicsVersion ) {
  return isBasicsVersion ? 0.95 : 1;
}

function getCentralElement( isBasicsVersion ) {
  return isBasicsVersion ? Element.C : Element.O;
}

function getRadialElement( isBasicsVersion ) {
  return isBasicsVersion ? Element.O : Element.H;
}

function getBondDataURL( isModel, isBasicsVersion ) {
  const angle = getAngle( isModel, isBasicsVersion );
  // basics is CO2, non-basics is H2O
  const centralElement = isModel ? undefined : getCentralElement( isBasicsVersion );
  const radialElement = isModel ? undefined : getRadialElement( isBasicsVersion );
  const bondOrder = isBasicsVersion ? 2 : 1;

  const molecule = new VSEPRMolecule();
  if ( !isModel ) {
    molecule.isReal = true;
  }
  const centralAtom = new PairGroup( new Vector3( 0, 0, 0 ), false, {
    element: centralElement
  } );
  molecule.addCentralAtom( centralAtom );
  molecule.addGroupAndBond( new PairGroup( new Vector3( Math.sin( angle ), -Math.cos( angle ), 0 ).times( PairGroup.BONDED_PAIR_DISTANCE ), false, { element: radialElement } ), centralAtom, bondOrder );
  molecule.addGroupAndBond( new PairGroup( new Vector3( -Math.sin( angle ), -Math.cos( angle ), 0 ).times( PairGroup.BONDED_PAIR_DISTANCE ), false, { element: radialElement } ), centralAtom, bondOrder );

  // TODO: This molecule isn't being passed in anymore?
  const model = new MoleculeShapesModel( false, { initialMolecule: molecule }, Tandem.OPT_OUT );

  const view = new MoleculeView( model, MoleculeShapesScreenView.createAPIStub( renderer ), molecule, {
    showLabel: () => {},
    finishedAddingLabels: () => {}
  }, Tandem.OPT_OUT );
  view.updateView();

  // change how atoms/bonds are scaled, so it can appear nicely
  const moleculeScale = 4.5 * getRelativeScale( isBasicsVersion );
  const atomScale = 2;
  const bondScale = 1;
  view.tweakViewScales( moleculeScale, atomScale, bondScale );

  const url = render( view, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, isBasicsVersion );
  view.dispose();
  return url;
}

class ScreenIconNode extends Node {
  /**
   * @param {boolean} isModel
   * @param {boolean} isBasicsVersion
   */
  constructor( isModel, isBasicsVersion ) {
    super();

    // Firefox doesn't immediately have the correct image bounds, so we set it to be overridden here
    this.localBounds = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.toBounds();

    const url = getBondDataURL( isModel, isBasicsVersion );
    this.addChild( new Image( url, {
      initialWidth: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width,
      initialHeight: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height
    } ) );

    const centralLabel = isModel ? 'A' : getCentralElement( isBasicsVersion ).symbol;
    const radialLabel = isModel ? 'X' : getRadialElement( isBasicsVersion ).symbol;

    const viewBondDistance = 192 * getRelativeScale( isBasicsVersion );
    const angle = getAngle( isModel, isBasicsVersion );
    const centerX = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width * 0.5;
    const centerY = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height * ( isBasicsVersion ? 0.5 : 0.4 );
    this.addChild( new Text( centralLabel, {
      fontSize: 80,
      fill: 'black',
      centerX: centerX,
      centerY: centerY
    } ) );
    this.addChild( new Text( radialLabel, {
      fontSize: 80,
      fill: 'black',
      centerX: centerX + Math.sin( angle ) * viewBondDistance,
      centerY: centerY + Math.cos( angle ) * viewBondDistance
    } ) );
    this.addChild( new Text( radialLabel, {
      fontSize: 80,
      fill: 'black',
      centerX: centerX - Math.sin( angle ) * viewBondDistance,
      centerY: centerY + Math.cos( angle ) * viewBondDistance
    } ) );
  }
}

moleculeShapes.register( 'ScreenIconNode', ScreenIconNode );
export default ScreenIconNode;