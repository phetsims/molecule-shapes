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
  var Vector2 = require( 'DOT/Vector2' );
  var Vector3 = require( 'DOT/Vector3' );
  var Plane3 = require( 'DOT/Plane3' );
  var Sphere3 = require( 'DOT/Sphere3' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var GeometryNamePanel = require( 'MOLECULE_SHAPES/common/view/GeometryNamePanel' );
  var LabelView = require( 'MOLECULE_SHAPES/common/view/3d/LabelView' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

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
    } ) : new THREE.CanvasRenderer( {
      devicePixelRatio: 1 // hopefully helps performance a bit
    } );

    MoleculeShapesColors.link( 'background', function( color ) {
      screenView.threeRenderer.setClearColor( color.toNumber(), 1 );
    } );

    MoleculeShapesScreenView.addLightsToScene( this.threeScene );

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


    this.overlayScene = new THREE.Scene();
    this.overlayCamera = new THREE.OrthographicCamera();
    this.overlayCamera.position.z = 50;


    this.addChild( new ResetAllButton( {
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      listener: function() {
        model.reset();
      },
      touchExpansion: 20
    } ) );

    this.addChild( new GeometryNamePanel( model, {
      left: this.layoutBounds.minX + 10,
      bottom: this.layoutBounds.maxY - 10
    } ) );

    // for computing rays
    this.projector = new THREE.Projector();

    // we only want to support dragging particles OR rotating the molecule (not both) at the same time
    var draggedParticleCount = 0;
    var isRotating = false;

    var multiDragListener = {
      down: function( event, trail ) {
        // ignore non-main-mouse-buttons
        if ( event.pointer.isMouse && event.domEvent && event.domEvent.button !== 0 ) {
          return;
        }

        // if we are already rotating the entire molecule, no more drags can be handled
        if ( isRotating ) {
          return;
        }

        var dragMode = null;
        var draggedParticle = null;

        var pair = screenView.getElectronPairUnderPointer( event.pointer, !event.pointer.isMouse );
        if ( pair && !pair.userControlled ) {
          dragMode = 'pairExistingSpherical';
          draggedParticle = pair;
          pair.userControlled = true;
          draggedParticleCount++;
        } else if ( draggedParticleCount === 0 ) { // we don't want to rotate while we are dragging any particles
          dragMode = 'modelRotate'; // modelRotate, pairFreshPlanar, pairExistingSpherical
          isRotating = true;
        } else {
          // can't drag the pair OR rotate the molecule
          return;
        }

        var lastGlobalPoint = event.pointer.point.copy();

        event.pointer.cursor = 'pointer';
        event.pointer.addInputListener( {
          up: function( event, trail ) {
            this.endDrag( event, trail );
            event.pointer.cursor = null;
          },

          cancel: function( event, trail ) {
            this.endDrag( event, trail );
            event.pointer.cursor = null;
          },

          move: function( event, trail ) {
            if ( dragMode === 'modelRotate' ) {
              var delta = event.pointer.point.minus( lastGlobalPoint );
              lastGlobalPoint.set( event.pointer.point );

              var scale = 0.007 / screenView.activeScale;
              var newQuaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( delta.y * scale, delta.x * scale, 0 ) );
              newQuaternion.multiply( model.moleculeQuaternion );
              model.moleculeQuaternion = newQuaternion;
            } else if ( dragMode === 'pairExistingSpherical' ) {
              draggedParticle.dragToPosition( screenView.getSphericalMoleculePosition( event.pointer.point, draggedParticle ) );
            }
          },

          // not a Scenery event
          endDrag: function( event, trail ) {
            if ( dragMode === 'pairExistingSpherical' ) {
              draggedParticle.userControlled = false;
              draggedParticleCount--;
            } else if ( dragMode === 'modelRotate' ) {
              isRotating = false;
            }
            event.pointer.removeInputListener( this );
          }
        } );
      }
    };
    this.backgroundEventTarget.addInputListener( multiDragListener );

    // TODO: update the cursor even if we don't move? (only if we have mouse movement)
    this.backgroundEventTarget.addInputListener( {
      mousemove: function( event, trail ) {
        screenView.backgroundEventTarget.cursor = screenView.getElectronPairUnderPointer( event.pointer, false ) ? 'pointer' : null;
      }
    } );

    var angleLabels = [];
    var labelViews = [];
    var numAngleLabelsVisible = 0;
    var angleLabelIndex = 0;
    for ( var i = 0; i < 15; i++ ) {
      if ( MoleculeShapesGlobals.useWebGL ) {
        labelViews[i] = new LabelView();
        this.overlayScene.add( labelViews[i] );
        labelViews[i].unsetLabel();
      } else {
        angleLabels[i] = new Text( '', {
          font: new PhetFont( 16 ),
          visible: false
        } );
        this.addChild( angleLabels[i] );
      }
    }
    MoleculeShapesColors.link( 'bondAngleReadout', function( color ) {
      _.each( angleLabels, function( angleLabel ) {
        angleLabel.fill = color;
      } );
    } );

    // update the molecule view's rotation when the model's rotation changes
    model.moleculeQuaternionProperty.link( function( quaternion ) {
      // moleculeView is created in the subtype (not yet). will handle initial rotation in addMoleculeView
      if ( screenView.moleculeView ) {
        screenView.moleculeView.quaternion.copy( quaternion );
        screenView.moleculeView.updateMatrix();
      }
    } );

    // TODO: turn stub into handler
    this.labelManager = {
      showLabel: function( string, brightness, centerDevicePoint, midDevicePoint ) {
        var globalCenter = new Vector2( ( centerDevicePoint.x + 1 ) * screenView.screenWidth / 2,
                                        ( -centerDevicePoint.y + 1 ) * screenView.screenHeight / 2 );
        var globalMidpoint = new Vector2( ( midDevicePoint.x + 1 ) * screenView.screenWidth / 2,
                                          ( -midDevicePoint.y + 1 ) * screenView.screenHeight / 2 );

        if ( MoleculeShapesGlobals.useWebGL ) {
          var labelView = labelViews[angleLabelIndex++];
          labelView.setLabel( string, brightness, globalCenter, globalMidpoint, screenView.getLayoutScale( screenView.screenWidth, screenView.screenHeight ) );
        } else {
          var localCenter = screenView.globalToLocalPoint( globalCenter );
          var localMidpoint = screenView.globalToLocalPoint( globalMidpoint );

          var label = angleLabels[angleLabelIndex++];
          label.visible = true;
          label.text = string;
          label.center = localMidpoint.plus( localMidpoint.minus( localCenter ).times( 0.3 ) );
          // TODO: optimize?
          label.fill = MoleculeShapesColors.bondAngleReadout.withAlpha( brightness );
        }
      },

      finishedAddingLabels: function() {
        // TODO: logic cleanup
        var numVisible = angleLabelIndex;
        while ( angleLabelIndex < numAngleLabelsVisible ) {
          if ( MoleculeShapesGlobals.useWebGL ) {
            labelViews[angleLabelIndex].unsetLabel();
          } else {
            angleLabels[angleLabelIndex].visible = false;
          }
          angleLabelIndex++;
        }
        angleLabelIndex = 0;
        numAngleLabelsVisible = numVisible;
      }
    };
  }

  return inherit( ScreenView, MoleculeShapesScreenView, {
    addMoleculeView: function( moleculeView ) {
      this.threeScene.add( moleculeView );

      this.moleculeView.quaternion.copy( this.model.moleculeQuaternion );
      this.moleculeView.updateMatrix();
    },

    removeMoleculeView: function( moleculeView ) {
      this.threeScene.remove( moleculeView );
    },

    getRaycasterFromScreenPoint: function( screenPoint ) {
      // normalized device coordinates
      var ndcX = 2 * screenPoint.x / this.screenWidth - 1;
      var ndcY = 2 * ( 1 - ( screenPoint.y / this.screenHeight ) ) - 1;

      var mousePoint = new THREE.Vector3( ndcX, ndcY, 0 );
      return this.projector.pickingRay( mousePoint, this.threeCamera );
    },

    // @param {THREE.Vector3} globalPoint
    convertScreenPointFromGlobalPoint: function( globalPoint ) {
      var point = globalPoint.clone();
      this.projector.projectVector( globalPoint, this.threeCamera );
      return point;
    },

    getRayFromScreenPoint: function( screenPoint ) {
      var threeRay = this.getRaycasterFromScreenPoint( screenPoint ).ray;
      return new Ray3( new Vector3().set( threeRay.origin ),
                       new Vector3().set( threeRay.direction ).normalize() );
    },

    getElectronPairUnderPointer: function( pointer, isTouch ) {
      var raycaster = this.getRaycasterFromScreenPoint( pointer.point );
      var worldRay = raycaster.ray;
      var cameraOrigin = worldRay.origin; // THREE.Vector3

      var shortestDistanceSquared = Number.POSITIVE_INFINITY;
      var closestGroup = null;

      var length = this.moleculeView.radialViews.length;
      for ( var i = 0; i < length; i++ ) {
        var view = this.moleculeView.radialViews[i];

        var intersectionPoint = view.intersect( worldRay, isTouch ); // THREE.Vector3
        if ( intersectionPoint ) {
          var distance = cameraOrigin.distanceToSquared( intersectionPoint );
          if ( distance < shortestDistanceSquared ) {
            shortestDistanceSquared = distance;
            closestGroup = view.group;
          }
        }
      }

      return closestGroup;
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

      var localCameraPosition = new Vector3().set( ray.origin );
      var localCameraDirection = new Vector3().set( ray.direction ).normalize();

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
      this.threeCamera.fov = ( sy > sx ? sy / sx : 1 ) * 50;
      this.activeScale = sy > sx ? sx : sy;

      // aspect ratio
      this.threeCamera.aspect = canvasWidth / canvasHeight;

      // near clipping plane
      this.threeCamera.near = 1;

      // far clipping plane
      this.threeCamera.far = 100;

      // three.js requires this to be called after changing the parameters
      this.threeCamera.updateProjectionMatrix();

      this.overlayCamera.left = 0;
      this.overlayCamera.right = width;
      this.overlayCamera.top = 0; // will this inversion work?
      this.overlayCamera.bottom = height;
      this.overlayCamera.near = 1;
      this.overlayCamera.far = 100;

      // three.js requires this to be called after changing the parameters
      this.overlayCamera.updateProjectionMatrix();

      // update the size of the renderer
      this.threeRenderer.setSize( Math.ceil( width ), Math.ceil( height ) );

      this.domNode.invalidateDOM();
    },

    step: function( dt ) {
      this.moleculeView.updateView();

      // var rnd = Math.random().toString();
      // this.labelView.setGlyph( 0, rnd[3] );
      // this.labelView.setGlyph( 1, rnd[4] );
      // this.labelView.setGlyph( 2, rnd[5] );
      // this.labelView.setGlyph( 4, rnd[6] );

      // render the 3D scene
      this.threeRenderer.render( this.threeScene, this.threeCamera );
      this.threeRenderer.autoClear = false;
      this.threeRenderer.render( this.overlayScene, this.overlayCamera );
      this.threeRenderer.autoClear = true;
    }
  }, {
    // where our camera is positioned in world coordinates (manually tuned)
    cameraPosition: new THREE.Vector3( 0.12 * 50, -0.025 * 50, 40 ),

    addLightsToScene: function( threeScene ) {
      var ambientLight = new THREE.AmbientLight( 0x191919 ); // closest to 0.1 like the original shader
      threeScene.add( ambientLight );

      var sunLight = new THREE.DirectionalLight( 0xffffff, 0.8 * 0.9 );
      sunLight.position.set( -1.0, 0.5, 2.0 );
      threeScene.add( sunLight );

      var moonLight = new THREE.DirectionalLight( 0xffffff, 0.6 * 0.9 );
      moonLight.position.set( 2.0, -1.0, 1.0 );
      threeScene.add( moonLight );
    }
  } );
} );
