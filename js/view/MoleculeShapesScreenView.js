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
  var Ray3 = require( 'DOT/Ray3' );
  var Vector3 = require( 'DOT/Vector3' );
  var Plane3 = require( 'DOT/Plane3' );
  var Sphere3 = require( 'DOT/Sphere3' );
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

    this.model = model;

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

    // for computing rays
    this.projector = new THREE.Projector();

    // we only want to support dragging particles OR rotating the molecule (not both) at the same time
    var draggedParticleCount = 0;
    var isRotating = false;

    var dragListener = new SimpleDragHandler( {
      start: function( event, trail ) {
        this.dragNode = null; // by default, don't do anything while dragging

        // if we are already rotating the entire molecule, no more drags can be handled
        if ( isRotating ) {
          return;
        }

        this.draggedPointer = event.pointer;

        var pair = screenView.getElectronPairUnderPointer( event.pointer );
        if ( pair && !pair.userControlled ) {
          this.dragMode = 'pairExistingSpherical';
          this.draggedParticle = pair;
          pair.userControlled = true;
          draggedParticleCount++;
        } else if ( draggedParticleCount === 0 ) { // we don't want to rotate while we are dragging any particles
          this.dragMode = 'modelRotate'; // modelRotate, pairFreshPlanar, pairExistingSpherical
          this.draggedParticle = null;
          isRotating = true;
        }
      },
      translate: function( data ) {
        if ( this.dragMode === 'modelRotate' ) {
          var delta = data.delta;
          var scale = 0.004 / screenView.activeScale;
          var newQuaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( delta.y * scale, delta.x * scale, 0 ) );
          newQuaternion.multiply( screenView.moleculeView.quaternion );
          screenView.moleculeView.quaternion.copy( newQuaternion );
          screenView.moleculeView.updateMatrix();
        } else if ( this.dragMode === 'pairExistingSpherical' ) {
          this.draggedParticle.dragToPosition( screenView.getSphericalMoleculePosition( this.draggedPointer.point, this.draggedParticle ) );
        }
      },
      end: function( event, trail ) {
        if ( this.dragMode === 'pairExistingSpherical' ) {
          this.draggedParticle.userControlled = false;
          draggedParticleCount--;
        } else if ( this.dragMode === 'modelRotate' ) {
          isRotating = false;
        }
      }
    } );
    this.backgroundEventTarget.addInputListener( dragListener );
  }

  return inherit( ScreenView, MoleculeShapesScreenView, {
    getRaycasterFromScreenPoint: function( screenPoint ) {
      // normalized device coordinates
      var ndcX = 2 * screenPoint.x / this.screenWidth - 1;
      var ndcY = 2 * ( 1 - ( screenPoint.y / this.screenHeight ) ) - 1;

      var mousePoint = new THREE.Vector3( ndcX, ndcY, 0 );
      return this.projector.pickingRay( mousePoint, this.threeCamera );
    },

    getRayFromScreenPoint: function( screenPoint ) {
      var threeRay = this.getRaycasterFromScreenPoint( screenPoint ).ray;
      return new Ray3( new Vector3( threeRay.origin.x, threeRay.origin.y, threeRay.origin.z ),
                       new Vector3( threeRay.direction.x, threeRay.direction.y, threeRay.direction.z ).normalize() );
    },

    getElectronPairUnderPointer: function( pointer ) {
      var raycaster = this.getRaycasterFromScreenPoint( pointer.point );
      var intersections = raycaster.intersectObjects( this.moleculeView.radialViews, true ); // recursive (yes)
      if ( intersections.length > 0 ) {
        var ob = intersections[0].object;
        while ( ob && !ob.group ) {
          assert && assert( ob.parent !== ob );
          ob = ob.parent;
        }
        return ob.group;
      } else {
        return null;
      }
    },

    /*
     * @param {Vector2} screenPoint
     * @returns {THREE.Vector3} in the moleculeView's local coordinate system
     */
    getPlanarMoleculePosition: function( screenPoint ) {
      var cameraRay = this.getRayFromScreenPoint( screenPoint );
      var intersection = Plane3.XY.intersectWithRay( cameraRay );
      var position = new THREE.Vector3( intersection.x, intersection.y, 0 );

      this.moleculeView.worldToLocal( position );

      return position;
    },

    // @returns {Vector3}
    getSphericalMoleculePosition: function( screenPoint, draggedParticle ) {
      // our main transform matrix and inverse
      var threeMatrix = this.moleculeView.matrix.clone();
      var threeInverseMatrix = new THREE.Matrix4();
      // threeMatrix.makeRotationFromQuaternion( this.moleculeView.quaternion );
      threeInverseMatrix.getInverse( threeMatrix );

      var raycaster = this.getRaycasterFromScreenPoint( screenPoint );

      var ray = raycaster.ray.clone();
      ray.applyMatrix4( threeInverseMatrix ); // global to local

      var localCameraPosition = new Vector3( ray.origin.x, ray.origin.y, ray.origin.z );
      var localCameraDirection = new Vector3( ray.direction.x, ray.direction.y, ray.direction.z ).normalize();

      // how far we will end up from the center atom
      var finalDistance = this.model.molecule.getIdealDistanceFromCenter( draggedParticle );

      // our sphere to cast our ray against

      var sphere = new Sphere3( new Vector3(), finalDistance );

      var epsilon = 0.000001;
      var intersections = sphere.intersections( new Ray3( localCameraPosition, localCameraDirection ), epsilon );
      if ( intersections.length === 0 ) {
        /*
         * Compute the point where the closest line through the camera and tangent to our bounding sphere intersects the sphere
         * ie, think 2d. we have a unit sphere centered at the origin, and a camera at (d,0). Our tangent point satisfies two
         * important conditions:
         * - it lies on the sphere. x^2 + y^2 == 1
         * - vector to the point (x,y) is tangent to the vector from (x,y) to our camera (d,0). thus (x,y) . (d-y, -y) == 0
         * Solve, and we get x = 1/d  plug back in for y (call that height), and we have our 2d solution.
         *
         * Now, back to 3D. Since camera is (0,0,d), our z == 1/d and our x^2 + y^2 == (our 2D y := height), then rescale them out of the unit sphere
         */

        var distanceFromCamera = localCameraPosition.distance( Vector3.ZERO );

        // first, calculate it in unit-sphere, as noted above
        var d = distanceFromCamera / finalDistance; // scaled distance to the camera (from the origin)
        var z = 1 / d; // our result z (down-scaled)
        var height = Math.sqrt( d * d - 1 ) / d; // our result (down-scaled) magnitude of (x,y,0), which is the radius of the circle composed of all points that could be tangent

        /*
         * Since our camera isn't actually on the z-axis, we need to calculate two vectors. One is the direction towards
         * the camera (planeNormal, easy!), and the other is the direction perpendicular to the planeNormal that points towards
         * the mouse pointer (planeHitDirection).
         */

        // intersect our camera ray against our perpendicular plane (perpendicular to our camera position from the origin) to determine the orientations
        var planeNormal = localCameraPosition.normalized();
        var t = -( localCameraPosition.magnitude() ) / ( planeNormal.dot( localCameraDirection ) );
        var planeHitDirection = localCameraPosition.plus( localCameraDirection.times( t ) ).normalized();

        // use the above plane hit direction (perpendicular to the camera) and plane normal (collinear with the camera) to calculate the result
        var downscaledResult = planeHitDirection.times( height ).plus( planeNormal.times( z ) );

        // scale it back to our sized sphere
        return downscaledResult.times( finalDistance );
      }
      else {
        // pick the hitPoint closer to our current point (won't flip to the other side of our sphere)
        return intersections[0].hitPoint.distance( draggedParticle.position ) < intersections[1].hitPoint.distance( draggedParticle.position ) ?
               intersections[0].hitPoint :
               intersections[1].hitPoint;
      }
    },

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
