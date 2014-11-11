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
  var Vector3 = require( 'DOT/Vector3' );
  var Util = require( 'DOT/Util' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/common/model/MoleculeShapesModel' );
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );
  var Screen = require( 'JOIST/Screen' );

  /*---------------------------------------------------------------------------*
  * Dynamic generation of the bonding/lone-pair panel images
  *----------------------------------------------------------------------------*/
  var scene = new THREE.Scene();
  MoleculeShapesScreenView.addLightsToScene( scene );

  var renderer = MoleculeShapesGlobals.useWebGL ? new THREE.WebGLRenderer( {
    antialias: true,
    preserveDrawingBuffer: true, // so we can toDataURL() it
    alpha: false // no transparency desired
  } ) : new THREE.CanvasRenderer();
  renderer.setClearColor( 0x333333, 1 );

  var camera = new THREE.PerspectiveCamera();

  function render( view, width, height ) {
    scene.add( view );

    camera.position.set( 0, -10, 200 );
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

  var modelAngle = Util.toRadians( 120 ) / 2;
  var realAngle = Util.toRadians( 104.5 ) / 2;
  function getBondDataURL( isModel ) {
    var angle = isModel ? modelAngle : realAngle;
    var centralElement = isModel ? undefined : Element.O;
    var radialElement = isModel ? undefined : Element.H;

    var molecule = new VSEPRMolecule();
    if ( !isModel ) {
      molecule.isReal = true;
    }
    var centralAtom = new PairGroup( new Vector3(), false, { element: centralElement } );
    molecule.addCentralAtom( centralAtom );
    molecule.addGroupAndBond( new PairGroup( new Vector3( Math.sin( angle ), -Math.cos( angle ) ).times( PairGroup.BONDED_PAIR_DISTANCE ), false, { element: radialElement } ), centralAtom, 1 );
    molecule.addGroupAndBond( new PairGroup( new Vector3( -Math.sin( angle ), -Math.cos( angle ) ).times( PairGroup.BONDED_PAIR_DISTANCE ), false, { element: radialElement } ), centralAtom, 1 );
    var model = new MoleculeShapesModel( false, {
      molecule: molecule
    } );

    var view = new MoleculeView( model, MoleculeShapesScreenView.createAPIStub(), molecule, { showLabel: function() {}, finishedAddingLabels: function() {} } );
    view.updateView();

    var moleculeScale = 4.5;
    var atomScale = 2;
    var bondScale = 1;
    view.scale.x = view.scale.y = view.scale.z = moleculeScale;
    view.centerAtomView.scale.x = view.centerAtomView.scale.y = view.centerAtomView.scale.z = atomScale;
    _.each( view.atomViews, function( atomView ) {
      atomView.scale.x = atomView.scale.y = atomView.scale.z = atomScale;
    } );
    _.each( view.bondViews, function( bondView ) {
      bondView.children[0].scale.x = bondView.children[0].scale.z = bondScale;
      bondView.children[1].scale.x = bondView.children[1].scale.z = bondScale;
    } );

    var url = render( view, Screen.HOME_SCREEN_ICON_SIZE.width, Screen.HOME_SCREEN_ICON_SIZE.height );
    view.dispose();
    return url;
  }

  function ScreenIconNode( isModel, isBasicsVersion ) {
    Node.call( this );

    // Firefox doesn't immediately have the correct image bounds, so we set it to be overridden here
    this.localBounds = Screen.HOME_SCREEN_ICON_SIZE.toBounds();

    var url = getBondDataURL( isModel );
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.addChild( new Image( url, { scale: 1 / devicePixelRatio } ) );

    var centralLabel = isModel ? 'A' : 'O';
    var radialLabel = isModel ? 'X' : 'H';

    var viewBondDistance = 192;
    var angle = isModel ? modelAngle : realAngle;
    var centerX = Screen.HOME_SCREEN_ICON_SIZE.width * 0.5;
    var centerY = Screen.HOME_SCREEN_ICON_SIZE.height * 0.4;
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

  return inherit( Node, ScreenIconNode, {} );
} );