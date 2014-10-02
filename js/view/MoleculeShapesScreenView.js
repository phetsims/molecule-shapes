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
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );

  /**
   * Constructor for the ModelMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function ModelMoleculesScreenView( model ) {
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 1024, 618 )
    } );

    var screenView = this;

    this.screenWidth = null;
    this.screenHeight = null;

    this.threeScene = new THREE.Scene();
    this.threeCamera = new THREE.PerspectiveCamera();

    this.threeRenderer = new THREE.WebGLRenderer( {
      antialias: true
    } );

    var ambientLight = new THREE.AmbientLight( 0x191919 ); // closest to 0.1 like the original shader
    this.threeScene.add( ambientLight );

    var sunLight = new THREE.DirectionalLight( 0xffffff, 0.8 * 0.9 );
    sunLight.position.set( -1.0, 0.5, 2.0 );
    this.threeScene.add( sunLight );

    var moonLight = new THREE.DirectionalLight( 0xffffff, 0.6 * 0.9 );
    moonLight.position.set( 2.0, -1.0, 1.0 );
    this.threeScene.add( moonLight );

    var material = new THREE.MeshLambertMaterial( {
      // color: 0xff0000,
      // ambient: 0xff000
    } );

    var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
    var sphere = new THREE.Mesh(geometry, material);
    this.threeScene.add( sphere );

    this.threeCamera.position.z = 40;

    this.domNode = new DOM( this.threeRenderer.domElement, {
      preventTransform: true, // Scenery 0.2 override for transformation
      invalidateDOM: function() {
        this.invalidateSelf( new Bounds2( 0, 0, screenView.screenWidth, screenView.screenHeight ) );
      }
    } );
    // Scenery 0.1 override for transformation
    this.domNode.updateCSSTransform = function() {};

    this.addChild( this.domNode );

    this.addChild( new ResetAllButton( { right: this.layoutBounds.maxX - 10, bottom: this.layoutBounds.maxY - 10 } ) );
  }

  return inherit( ScreenView, ModelMoleculesScreenView, {
    layout: function( width, height ) {
      ScreenView.prototype.layout.call( this, width, height );

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
      // render the 3D scene
      this.threeRenderer.render( this.threeScene, this.threeCamera );
    }
  } );
} );
