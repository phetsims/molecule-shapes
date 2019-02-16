// Copyright 2014-2017, University of Colorado Boulder

/**
 * Dynamically generates the screen icons by rendering 3D scenes into an image and displaying atom labels on top.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Element = require( 'NITROGLYCERIN/Element' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/common/model/MoleculeShapesModel' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var Screen = require( 'JOIST/Screen' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector3 = require( 'DOT/Vector3' );
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' );

  /*---------------------------------------------------------------------------*
   * Dynamic generation of the molecules
   *----------------------------------------------------------------------------*/
  var scene = new THREE.Scene();
  MoleculeShapesScreenView.addLightsToScene( scene );

  var renderer = MoleculeShapesGlobals.useWebGLProperty.get() ? new THREE.WebGLRenderer( {
    antialias: true,
    preserveDrawingBuffer: true, // so we can toDataURL() it
    alpha: true // transparency needs to be enabled, even though we don't need it here. see #98
  } ) : new THREE.CanvasRenderer();

  var camera = new THREE.PerspectiveCamera();

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
      return isModel ? Util.toRadians( 120 ) / 2 : Util.toRadians( 104.5 ) / 2;
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
    var angle = getAngle( isModel, isBasicsVersion );
    // basics is CO2, non-basics is H2O
    var centralElement = isModel ? undefined : getCentralElement( isBasicsVersion );
    var radialElement = isModel ? undefined : getRadialElement( isBasicsVersion );
    var bondOrder = isBasicsVersion ? 2 : 1;

    var molecule = new VSEPRMolecule();
    if ( !isModel ) {
      molecule.isReal = true;
    }
    var centralAtom = new PairGroup( new Vector3( 0, 0, 0 ), false, {
      element: centralElement
    } );
    molecule.addCentralAtom( centralAtom );
    molecule.addGroupAndBond( new PairGroup( new Vector3( Math.sin( angle ), -Math.cos( angle ), 0 ).times( PairGroup.BONDED_PAIR_DISTANCE ), false, { element: radialElement } ), centralAtom, bondOrder );
    molecule.addGroupAndBond( new PairGroup( new Vector3( -Math.sin( angle ), -Math.cos( angle ), 0 ).times( PairGroup.BONDED_PAIR_DISTANCE ), false, { element: radialElement } ), centralAtom, bondOrder );
    var model = new MoleculeShapesModel( false, {
      molecule: molecule
    } );

    var view = new MoleculeView( model, MoleculeShapesScreenView.createAPIStub( renderer ), molecule, {
      showLabel: function() {},
      finishedAddingLabels: function() {}
    } );
    view.updateView();

    // change how atoms/bonds are scaled, so it can appear nicely
    var moleculeScale = 4.5 * getRelativeScale( isBasicsVersion );
    var atomScale = 2;
    var bondScale = 1;
    view.tweakViewScales( moleculeScale, atomScale, bondScale );

    var url = render( view, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, isBasicsVersion );
    view.dispose();
    return url;
  }

  /**
   * @constructor
   *
   * @param {boolean} isModel
   * @param {boolean} isBasicsVersion
   */
  function ScreenIconNode( isModel, isBasicsVersion ) {
    Node.call( this );

    // Firefox doesn't immediately have the correct image bounds, so we set it to be overridden here
    this.localBounds = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.toBounds();

    var url = getBondDataURL( isModel, isBasicsVersion );
    this.addChild( new Image( url, {
      initialWidth: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width,
      initialHeight: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height
    } ) );

    var centralLabel = isModel ? 'A' : getCentralElement( isBasicsVersion ).symbol;
    var radialLabel = isModel ? 'X' : getRadialElement( isBasicsVersion ).symbol;

    var viewBondDistance = 192 * getRelativeScale( isBasicsVersion );
    var angle = getAngle( isModel, isBasicsVersion );
    var centerX = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width * 0.5;
    var centerY = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height * ( isBasicsVersion ? 0.5 : 0.4 );
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

  moleculeShapes.register( 'ScreenIconNode', ScreenIconNode );

  return inherit( Node, ScreenIconNode, {} );
} );