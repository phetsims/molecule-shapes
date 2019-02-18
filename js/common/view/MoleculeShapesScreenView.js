// Copyright 2014-2019, University of Colorado Boulder

/**
 * Base view for all "show a single molecule in the center" screens
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var ContextLossFailureDialog = require( 'SCENERY_PHET/ContextLossFailureDialog' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var GeometryNamePanel = require( 'MOLECULE_SHAPES/common/view/GeometryNamePanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LabelFallbackNode = require( 'MOLECULE_SHAPES/common/view/LabelFallbackNode' );
  var LabelWebGLView = require( 'MOLECULE_SHAPES/common/view/3d/LabelWebGLView' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var Mouse = require( 'SCENERY/input/Mouse' );
  var Plane3 = require( 'DOT/Plane3' );
  var Ray3 = require( 'DOT/Ray3' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Sphere3 = require( 'DOT/Sphere3' );
  var Vector3 = require( 'DOT/Vector3' );

  /**
   * @constructor
   *
   * @param {ModelMoleculesModel} model the model for the entire screen
   */
  function MoleculeShapesScreenView( model ) {
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 1024, 618 )
    } );

    var self = this;

    this.model = model; // @private {ModelMoleculesModel}

    // our target for drags that don't hit other UI components
    this.backgroundEventTarget = Rectangle.bounds( this.layoutBounds, {} ); // @private
    this.addChild( this.backgroundEventTarget );

    // updated in layout
    this.activeScale = 1; // @private scale applied to interaction that isn't directly tied to screen coordinates (rotation)
    this.screenWidth = null; // @public
    this.screenHeight = null; // @public

    // main three.js Scene setup
    this.threeScene = new THREE.Scene(); // @private
    this.threeCamera = new THREE.PerspectiveCamera(); // @private will set the projection parameters on layout

    // @public {THREE.Renderer}
    this.threeRenderer = MoleculeShapesGlobals.useWebGLProperty.get() ? new THREE.WebGLRenderer( {
      antialias: true,
      preserveDrawingBuffer: phet.chipper.queryParameters.preserveDrawingBuffer
    } ) : new THREE.CanvasRenderer( {
      devicePixelRatio: 1 // hopefully helps performance a bit
    } );

    this.threeRenderer.setPixelRatio( window.devicePixelRatio || 1 );

    // @private {ContextLossFailureDialog|null} - dialog shown on context loss, constructed
    // lazily because Dialog requires sim bounds during construction
    this.contextLossDialog = null;

    // In the event of a context loss, we'll just show a dialog. See https://github.com/phetsims/molecule-shapes/issues/100
    if ( MoleculeShapesGlobals.useWebGLProperty.get() ) {
      this.threeRenderer.context.canvas.addEventListener( 'webglcontextlost', function( event ) {
        event.preventDefault();

        self.showContextLossDialog();

        if ( document.domain === 'phet.colorado.edu' ) {
          window._gaq && window._gaq.push( [ '_trackEvent', 'WebGL Context Loss', 'molecule-shapes ' + phet.joist.sim.version, document.URL ] );
        }
      } );
    }

    MoleculeShapesColorProfile.backgroundProperty.link( function( color ) {
      self.threeRenderer.setClearColor( color.toNumber(), 1 );
    } );

    MoleculeShapesScreenView.addLightsToScene( this.threeScene );

    this.threeCamera.position.copy( MoleculeShapesScreenView.cameraPosition ); // sets the camera's position

    // @private add the Canvas in with a DOM node that prevents Scenery from applying transformations on it
    this.domNode = new DOM( this.threeRenderer.domElement, {
      preventTransform: true, // Scenery 0.2 override for transformation
      invalidateDOM: function() { // don't do bounds detection, it's too expensive. We're not pickable anyways
        this.invalidateSelf( new Bounds2( 0, 0, 0, 0 ) );
      },
      pickable: false
    } );
    this.domNode.invalidateDOM();
    // Scenery 0.1 override for transformation
    this.domNode.updateCSSTransform = function() {};

    // support Scenery/Joist 0.2 screenshot (takes extra work to output)
    this.domNode.renderToCanvasSelf = function( wrapper ) {
      var canvas = null;

      var effectiveWidth = Math.ceil( self.screenWidth );
      var effectiveHeight = Math.ceil( self.screenHeight );

      // This WebGL workaround is so we can avoid the preserveDrawingBuffer setting that would impact performance.
      // We render to a framebuffer and extract the pixel data directly, since we can't create another renderer and
      // share the view (three.js constraint).
      if ( MoleculeShapesGlobals.useWebGLProperty.get() ) {

        // set up a framebuffer (target is three.js terminology) to render into
        var target = new THREE.WebGLRenderTarget( effectiveWidth, effectiveHeight, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.NearestFilter,
          format: THREE.RGBAFormat
        } );
        // render our screen content into the framebuffer
        self.render( target );

        // set up a buffer for pixel data, in the exact typed formats we will need
        var buffer = new window.ArrayBuffer( effectiveWidth * effectiveHeight * 4 );
        var imageDataBuffer = new window.Uint8ClampedArray( buffer );
        var pixels = new window.Uint8Array( buffer );

        // read the pixel data into the buffer
        var gl = self.threeRenderer.getContext();
        gl.readPixels( 0, 0, effectiveWidth, effectiveHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels );

        // create a Canvas with the correct size, and fill it with the pixel data
        canvas = document.createElement( 'canvas' );
        canvas.width = effectiveWidth;
        canvas.height = effectiveHeight;
        var tmpContext = canvas.getContext( '2d' );
        var imageData = tmpContext.createImageData( effectiveWidth, effectiveHeight );
        imageData.data.set( imageDataBuffer );
        tmpContext.putImageData( imageData, 0, 0 );
      }
      else {
        // If just falling back to Canvas, we can directly render out!
        canvas = self.threeRenderer.domElement;
      }

      var context = wrapper.context;
      context.save();

      if ( MoleculeShapesGlobals.useWebGLProperty.get() ) {
        context.setTransform( 1, 0, 0, -1, 0, effectiveHeight ); // no need to take pixel scaling into account
      }
      else {
        context.setTransform( 1, 0, 0, 1, 0, 0 );
      }
      context.drawImage( canvas, 0, 0 );
      context.restore();
    };

    this.addChild( this.domNode );

    // overlay Scene for bond-angle labels (if WebGL)
    this.overlayScene = new THREE.Scene(); // @private
    this.overlayCamera = new THREE.OrthographicCamera(); // @private
    this.overlayCamera.position.z = 50; // @private

    this.addChild( new ResetAllButton( {
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      listener: function() {
        model.reset();
      }
    } ) );

    this.addChild( new GeometryNamePanel( model, {
      left: this.layoutBounds.minX + 10,
      bottom: this.layoutBounds.maxY - 10
    } ) );

    // we only want to support dragging particles OR rotating the molecule (not both) at the same time
    var draggedParticleCount = 0;
    var isRotating = false;

    var multiDragListener = {
      down: function( event, trail ) {
        if ( !event.canStartPress() ) { return; }

        // if we are already rotating the entire molecule, no more drags can be handled
        if ( isRotating ) {
          return;
        }

        var dragMode = null;
        var draggedParticle = null;

        var pair = self.getElectronPairUnderPointer( event.pointer, !( event.pointer instanceof Mouse ) );
        if ( pair && !pair.userControlledProperty.get() ) {
          // we start dragging that pair group with this pointer, moving it along the sphere where it can exist
          dragMode = 'pairExistingSpherical';
          draggedParticle = pair;
          pair.userControlledProperty.set( true );
          draggedParticleCount++;
        }
        else if ( draggedParticleCount === 0 ) { // we don't want to rotate while we are dragging any particles
          // we rotate the entire molecule with this pointer
          dragMode = 'modelRotate';
          isRotating = true;
        }
        else {
          // can't drag the pair OR rotate the molecule
          return;
        }

        var lastGlobalPoint = event.pointer.point.copy();

        event.pointer.cursor = 'pointer';
        event.pointer.addInputListener( {
          // end drag on either up or cancel (not supporting full cancel behavior)
          up: function( event, trail ) {
            this.endDrag( event, trail );
          },
          cancel: function( event, trail ) {
            this.endDrag( event, trail );
          },

          move: function( event, trail ) {
            if ( dragMode === 'modelRotate' ) {
              var delta = event.pointer.point.minus( lastGlobalPoint );
              lastGlobalPoint.set( event.pointer.point );

              var scale = 0.007 / self.activeScale; // tuned constant for acceptable drag motion
              var newQuaternion = new THREE.Quaternion().setFromEuler( new THREE.Euler( delta.y * scale, delta.x * scale, 0 ) );
              newQuaternion.multiply( model.moleculeQuaternionProperty.get() );
              model.moleculeQuaternionProperty.value = newQuaternion;
            }
            else if ( dragMode === 'pairExistingSpherical' ) {
              if ( _.includes( model.moleculeProperty.get().groups, draggedParticle ) ) {
                draggedParticle.dragToPosition( self.getSphericalMoleculePosition( event.pointer.point, draggedParticle ) );
              }
            }
          },

          // not a Scenery event
          endDrag: function( event, trail ) {
            if ( dragMode === 'pairExistingSpherical' ) {
              draggedParticle.userControlledProperty.set( false );
              draggedParticleCount--;
            }
            else if ( dragMode === 'modelRotate' ) {
              isRotating = false;
            }
            event.pointer.removeInputListener( this );
            event.pointer.cursor = null;
          }
        } );
      }
    };
    this.backgroundEventTarget.addInputListener( multiDragListener );

    // Consider updating the cursor even if we don't move? (only if we have mouse movement)? Current development
    // decision is to ignore this edge case in favor of performance.
    this.backgroundEventTarget.addInputListener( {
      mousemove: function( event ) {
        self.backgroundEventTarget.cursor = self.getElectronPairUnderPointer( event.pointer, false ) ? 'pointer' : null;
      }
    } );

    // update the molecule view's rotation when the model's rotation changes
    model.moleculeQuaternionProperty.link( function( quaternion ) {
      // moleculeView is created in the subtype (not yet). will handle initial rotation in addMoleculeView
      if ( self.moleculeView ) {
        self.moleculeView.quaternion.copy( quaternion );
        self.moleculeView.updateMatrix();
        self.moleculeView.updateMatrixWorld();
      }
    } );

    // @private - create a pool of angle labels of the desired type
    this.angleLabels = [];
    for ( var i = 0; i < 15; i++ ) {
      if ( MoleculeShapesGlobals.useWebGLProperty.get() ) {
        this.angleLabels[ i ] = new LabelWebGLView( this.threeRenderer );
        this.overlayScene.add( this.angleLabels[ i ] );
        this.angleLabels[ i ].unsetLabel();
      }
      else {
        this.angleLabels[ i ] = new LabelFallbackNode();
        this.addChild( this.angleLabels[ i ] );
      }
    }
  }

  moleculeShapes.register( 'MoleculeShapesScreenView', MoleculeShapesScreenView );

  return inherit( ScreenView, MoleculeShapesScreenView, {
    /**
     * @private
     */
    showContextLossDialog: function() {
      if ( !this.contextLossDialog ) {
        this.contextLossDialog = new ContextLossFailureDialog();
      }
      this.contextLossDialog.show();
    },

    /**
     * Removes a bond-angle label from the pool to be controlled
     * @public
     */
    checkOutLabel: function() {
      var label = this.angleLabels.pop();
      assert && assert( label );
      return label;
    },

    /**
     * Returns a bond-angle label to the pool
     * @public
     */
    returnLabel: function( label ) {
      assert && assert( !_.includes( this.angleLabels, label ) );
      this.angleLabels.push( label );
      label.unsetLabel();
    },

    /**
     * Adds a molcule view.
     * @public
     *
     * @param {MoleculeView} moleculeView
     */
    addMoleculeView: function( moleculeView ) {
      this.threeScene.add( moleculeView );

      this.moleculeView.quaternion.copy( this.model.moleculeQuaternionProperty.get() );
      this.moleculeView.updateMatrix();
      this.moleculeView.updateMatrixWorld();
    },

    /**
     * Removes a molcule view.
     * @public
     *
     * @param {MoleculeView} moleculeView
     */
    removeMoleculeView: function( moleculeView ) {
      this.threeScene.remove( moleculeView );
    },

    /*
     * @private
     * @param {Vector3} screenPoint
     * @returns {THREE.Raycaster}
     */
    getRaycasterFromScreenPoint: function( screenPoint ) {
      // normalized device coordinates
      var ndcX = 2 * screenPoint.x / this.screenWidth - 1;
      var ndcY = 2 * ( 1 - ( screenPoint.y / this.screenHeight ) ) - 1;

      var mousePoint = new THREE.Vector3( ndcX, ndcY, 0 );
      var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera( mousePoint, this.threeCamera );
      return raycaster;
    },

    /*
     * Global => NDC
     * @public
     *
     * @param {THREE.Vector3} globalPoint
     * @returns {THREE.Vector3}
     */
    convertScreenPointFromGlobalPoint: function( globalPoint ) {
      globalPoint.project( this.threeCamera );
    },

    /*
     * @private
     *
     * @param {Vector3} screenPoint
     * @returns {Ray3}
     */
    getRayFromScreenPoint: function( screenPoint ) {
      var threeRay = this.getRaycasterFromScreenPoint( screenPoint ).ray;
      return new Ray3( new Vector3( 0, 0, 0 ).set( threeRay.origin ),
        new Vector3( 0, 0, 0 ).set( threeRay.direction ).normalize() );
    },

    /*
     * @private
     *
     * @param {Pointer} pointer
     * @param {boolean} isTouch - Whether we should use touch regions
     * @returns {PairGroup | null} - The closest pair group, or null
     */
    getElectronPairUnderPointer: function( pointer, isTouch ) {
      var raycaster = this.getRaycasterFromScreenPoint( pointer.point );
      var worldRay = raycaster.ray;
      var cameraOrigin = worldRay.origin; // THREE.Vector3

      var shortestDistanceSquared = Number.POSITIVE_INFINITY;
      var closestGroup = null;

      var length = this.moleculeView.radialViews.length;
      for ( var i = 0; i < length; i++ ) {
        var view = this.moleculeView.radialViews[ i ];

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
     * The position in the moleculeView's coordinate system (where z=0 in the view coordinate system) for a
     * corresponding screenPoint.
     * @public
     *
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

    /*
     * Returns the closest molecule model-space point on the sphere whose radius is the bond's radius.
     * @public
     *
     * @param {Vector3} screenPoint
     * @param {PairGroup} draggedParticle
     * @returns {Vector3}
     */
    getSphericalMoleculePosition: function( screenPoint, draggedParticle ) {
      // our main transform matrix and inverse
      var threeMatrix = this.moleculeView.matrix.clone();
      var threeInverseMatrix = new THREE.Matrix4();
      threeInverseMatrix.getInverse( threeMatrix );

      var raycaster = this.getRaycasterFromScreenPoint( screenPoint ); // {THREE.Raycaster}

      var ray = raycaster.ray.clone(); // {THREE.Ray}
      ray.applyMatrix4( threeInverseMatrix ); // global to local

      var localCameraPosition = new Vector3( 0, 0, 0 ).set( ray.origin );
      var localCameraDirection = new Vector3( 0, 0, 0 ).set( ray.direction ).normalize();

      // how far we will end up from the center atom
      var finalDistance = this.model.moleculeProperty.get().getIdealDistanceFromCenter( draggedParticle );

      // our sphere to cast our ray against
      var sphere = new Sphere3( new Vector3( 0, 0, 0 ), finalDistance );

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
        return intersections[ 0 ].hitPoint.distance( draggedParticle.positionProperty.get() ) < intersections[ 1 ].hitPoint.distance( draggedParticle.positionProperty.get() ) ?
               intersections[ 0 ].hitPoint :
               intersections[ 1 ].hitPoint;
      }
    },

    /**
     * @override
     * @protected
     */
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

      // It's a bit tricky, since if we are vertically-constrained, we don't need to adjust the camera's FOV (since the
      // width of the scene will scale proportionally to the scale we display our contents at). It's only when our view
      // is horizontally-constrained where we have to account for the changed aspect ratio, and adjust the FOV so that
      // the molecule shows up at a scale of "sy / sx" compared to the normal case. Note that sx === sy is where our
      // layout bounds fit perfectly in the window, so we don't really have a constraint.
      // Most of the complexity here is that threeCamera.fov is in degrees, and our ideal vertically-constrained FOV is
      // 50 (so there's conversion factors in place).
      var c = Math.tan( 25 * Math.PI / 180 ); // constant that will output the factor to use to maintain our 50 degree FOV
      var adaptiveScale = Math.atan( c * sy / sx ) * 2 * 180 / Math.PI; // apply correction scales to maintain correct FOV
      this.threeCamera.fov = sx > sy ? 50 : adaptiveScale;
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

    /**
     * @override
     * @public
     *
     * @param {number} dt - Amount of time elapsed
     */
    step: function( dt ) {
      this.moleculeView.updateView();

      this.render( undefined );
    },

    /**
     * Renders the simulation to a specific rendering target
     * @public
     *
     * @param {THREE.WebGLRenderTarget | undefined} - undefined for the default target
     */
    render: function( target ) {
      // render the 3D scene first
      this.threeRenderer.render( this.threeScene, this.threeCamera, target );
      this.threeRenderer.autoClear = false;
      // then render the 2D overlay on top, without clearing the Canvas in-between
      this.threeRenderer.render( this.overlayScene, this.overlayCamera, target );
      this.threeRenderer.autoClear = true;
    }
  }, {
    // @public - where our camera is positioned in world coordinates (manually tuned)
    cameraPosition: new THREE.Vector3( 0.12 * 50, -0.025 * 50, 40 ),

    /**
     * @public
     *
     * @param {THREE.Scene} threeScene
     */
    addLightsToScene: function( threeScene ) {
      var ambientLight = new THREE.AmbientLight( 0x191919 ); // closest to 0.1 like the original shader
      threeScene.add( ambientLight );

      var sunLight = new THREE.DirectionalLight( 0xffffff, 0.8 * 0.9 );
      sunLight.position.set( -1.0, 0.5, 2.0 );
      threeScene.add( sunLight );

      var moonLight = new THREE.DirectionalLight( 0xffffff, 0.6 * 0.9 );
      moonLight.position.set( 2.0, -1.0, 1.0 );
      threeScene.add( moonLight );
    },

    /**
     * Duck-typed to have the same API as needed by views
     * @public
     *
     * @returns {Object}
     */
    createAPIStub: function( renderer ) {
      return {
        threeRenderer: renderer,
        checkOutLabel: function() {
          return {
            setLabel: function() {},
            unsetLabel: function() {}
          };
        },
        returnLabel: function() {}
      };
    }
  } );
} );
