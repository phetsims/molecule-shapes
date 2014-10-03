//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Base view for all "show a single molecule in the center" screens
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/view/MoleculeShapesGlobals' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var GeometryNamePanel = require( 'MOLECULE_SHAPES/view/GeometryNamePanel' );

  /**
   * Constructor for the MoleculeShapesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function MoleculeShapesScreenView( model ) {
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 1024, 618 ),
      renderer: 'svg'
    } );

    var screenView = this;

    this.backgroundEventTarget = Rectangle.bounds( this.layoutBounds, {} );
    this.addChild( this.backgroundEventTarget );

    this.activeScale = 1; // updated in layout

    this.screenWidth = null;
    this.screenHeight = null;

    this.threeScene = new THREE.Scene();
    this.threeCamera = new THREE.PerspectiveCamera();

    this.threeRenderer = MoleculeShapesGlobals.useWebGL ? new THREE.WebGLRenderer( {
      antialias: true
    } ) : new THREE.CanvasRenderer();

    MoleculeShapesColors.link( 'background', function( color ) {
      screenView.threeRenderer.setClearColor( color.toNumber(), 1 );
    } );

    var ambientLight = new THREE.AmbientLight( 0x191919 ); // closest to 0.1 like the original shader
    this.threeScene.add( ambientLight );

    var sunLight = new THREE.DirectionalLight( 0xffffff, 0.8 * 0.9 );
    sunLight.position.set( -1.0, 0.5, 2.0 );
    this.threeScene.add( sunLight );

    var moonLight = new THREE.DirectionalLight( 0xffffff, 0.6 * 0.9 );
    moonLight.position.set( 2.0, -1.0, 1.0 );
    this.threeScene.add( moonLight );

    this.threeCamera.position.copy( MoleculeShapesScreenView.cameraPosition );

    this.domNode = new DOM( this.threeRenderer.domElement, {
      preventTransform: true, // Scenery 0.2 override for transformation
      invalidateDOM: function() {
        this.invalidateSelf( new Bounds2( 0, 0, 0, 0 ) );
      },
      pickable: false
    } );
    this.domNode.invalidateDOM();
    // Scenery 0.1 override for transformation
    this.domNode.updateCSSTransform = function() {};

    this.addChild( this.domNode );

    this.addChild( new ResetAllButton( {
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      listener: function() {
        model.reset();
      },
      touchExpansion: 20
    } ) );

    this.addChild( new GeometryNamePanel( model.moleculeProperty, !model.isBasicsVersion, {
      left: this.layoutBounds.minX + 10,
      bottom: this.layoutBounds.maxY - 10
    } ) );

    /*---------------------------------------------------------------------------*
    * Temporary
    *----------------------------------------------------------------------------*/
    this.addChild( new TextPushButton( 'Regular Colors', {
      baseColor: '#888',
      right: this.layoutBounds.right - 10,
      bottom: this.layoutBounds.bottom - 110,
      scale: 0.5,
      listener: function() {
        MoleculeShapesColors.applyProfile( 'default' );
      }
    } ) );
    this.addChild( new TextPushButton( 'Basics Colors', {
      baseColor: '#888',
      right: this.layoutBounds.right - 10,
      bottom: this.layoutBounds.bottom - 90,
      scale: 0.5,
      listener: function() {
        MoleculeShapesColors.applyProfile( 'default' );
        MoleculeShapesColors.applyProfile( 'basics' );
      }
    } ) );
    this.addChild( new TextPushButton( 'Projector Colors', {
      baseColor: '#888',
      right: this.layoutBounds.right - 10,
      bottom: this.layoutBounds.bottom - 70,
      scale: 0.5,
      listener: function() {
        MoleculeShapesColors.applyProfile( 'default' );
        MoleculeShapesColors.applyProfile( 'projector' );
      }
    } ) );

    var dragListener = new SimpleDragHandler( {
      start: function( event, trail ) {
        this.dragMode = 'modelRotate'; // modelRotate, pairFreshPlanar, pairExistingSpherical
      },
      translate: function( data ) {
        var delta = data.delta;
        var scale = 0.004 / screenView.activeScale;
        var newQuaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( delta.y * scale, delta.x * scale, 0 ) );
        newQuaternion.multiply( screenView.moleculeView.quaternion );
        screenView.moleculeView.quaternion.copy( newQuaternion );
        screenView.moleculeView.updateMatrix();
      },
      end: function( event, trail ) {

      }
    } );
    this.backgroundEventTarget.addInputListener( dragListener );
  }

  return inherit( ScreenView, MoleculeShapesScreenView, {

    layout: function( width, height ) {
      ScreenView.prototype.layout.call( this, width, height );

      this.backgroundEventTarget.setRectBounds( this.globalToLocalBounds( new Bounds2( 0, 0, width, height ) ) );

      this.screenWidth = width;
      this.screenHeight = height;

      var canvasWidth = Math.ceil( width );
      var canvasHeight = Math.ceil( height );

      // field of view (FOV) computation for the isometric view scaling we use
      var sx = canvasWidth / this.layoutBounds.width;
      var sy = canvasHeight / this.layoutBounds.height;
      if ( sx === 0 || sy === 0 ) {
        return 1;
      }
      this.threeCamera.fov = sy > sx ? sy / sx : 1;
      this.activeScale = sy > sx ? sx : sy;

      // aspect ratio
      this.threeCamera.aspect = canvasWidth / canvasHeight;

      // near clipping plane
      this.threeCamera.near = 1;

      // far clipping plane
      this.threeCamera.far = 100;

      // three.js requires this to be called after changing the parameters
      this.threeCamera.updateProjectionMatrix();

      // update the size of the renderer
      this.threeRenderer.setSize( Math.ceil( width ), Math.ceil( height ) );

      this.domNode.invalidateDOM();
    },

    step: function( dt ) {
      this.moleculeView.updateView();

      // render the 3D scene
      this.threeRenderer.render( this.threeScene, this.threeCamera );
    }
  }, {
    // where our camera is positioned in world coordinates
    cameraPosition: new THREE.Vector3( 0.1, 0, 40 )
  } );
} );
