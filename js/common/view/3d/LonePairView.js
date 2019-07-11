// Copyright 2014-2019, University of Colorado Boulder

/**
 * View of a lone pair
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var ElectronView = require( 'MOLECULE_SHAPES/common/view/3d/ElectronView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );
  var LocalPool = require( 'MOLECULE_SHAPES/common/view/3d/LocalPool' );
  var LonePairGeometryData = require( 'MOLECULE_SHAPES/common/data/LonePairGeometryData' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );

  var jsonLoader = new THREE.JSONLoader();

  // geometry used for display
  var masterShellGeometry = jsonLoader.parse( MoleculeShapesGlobals.useWebGLProperty.get() ? LonePairGeometryData.HIGH_DETAIL : LonePairGeometryData.LOW_DETAIL_QUADS ).geometry;
  // renderer-local access
  var localShellGeometry = new LocalGeometry( masterShellGeometry );
  var localShellMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
    transparent: true,
    opacity: 0.7,
    depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
    overdraw: MoleculeShapesGlobals.useWebGLProperty.get() ? 0 : 0.1 // amount to extend polygons when using Canvas to avoid cracks
  } ), {
    color: MoleculeShapesColorProfile.lonePairShellProperty
  } );

  // geometries used for hit testing (includes a larger touch hit mesh)
  var mouseHitTestGeometry = jsonLoader.parse( LonePairGeometryData.LOW_DETAIL ).geometry;
  var touchHitTestGeometry = jsonLoader.parse( LonePairGeometryData.LOW_DETAIL_EXTRUDED ).geometry;

  /*
   * @constructor
   * @param {THREE.Renderer} renderer
   */
  function LonePairView( renderer ) {
    var self = this;

    THREE.Object3D.call( this );

    this.renderer = renderer; // @private {THREE.Renderer}
    this.shellGeometry = localShellGeometry.get( renderer ); // @private {THREE.Geometry}
    this.shellMaterial = localShellMaterial.get( renderer ); // @private {THREE.Material}

    this.shell = new THREE.Mesh( this.shellGeometry, this.shellMaterial ); // @private {THREE.Mesh}

    // scale for the shell geometries (for display and hit testing)
    var shellScale = 2.5;

    this.shell.scale.x = this.shell.scale.y = this.shell.scale.z = shellScale;
    this.shell.position.y = 0.001; // slight offset so three.js will z-sort the shells correctly for the transparency pass
    this.add( this.shell );

    this.electronView1 = new ElectronView( renderer ); // @private
    this.electronView2 = new ElectronView( renderer ); // @private
    this.add( this.electronView1 );
    this.add( this.electronView2 );

    this.electronView1.position.x = 0.75;
    this.electronView2.position.x = -0.75;
    this.electronView1.position.y = this.electronView2.position.y = 5;

    if ( phet.chipper.queryParameters.showPointerAreas ) {
      var touchShell = new THREE.Mesh( touchHitTestGeometry.clone(), new THREE.MeshBasicMaterial( {
        color: 0xff0000,
        transparent: true,
        opacity: 0.4,
        depthWrite: false
      } ) );
      touchShell.scale.x = touchShell.scale.y = touchShell.scale.z = shellScale;
      touchShell.renderDepth = 11;
      this.add( touchShell );
    }

    // @private - per-instance listener, so it's easier to link and unlink
    this.positionListener = function( position ) {
      var offsetFromParentAtom = position.minus( self.parentAtom.positionProperty.get() );
      var orientation = offsetFromParentAtom.normalized();

      var translation;
      if ( offsetFromParentAtom.magnitude > PairGroup.LONE_PAIR_DISTANCE ) {
        translation = position.minus( orientation.times( PairGroup.LONE_PAIR_DISTANCE ) );
      }
      else {
        translation = self.parentAtom.positionProperty.get();
      }

      self.position.set( translation.x, translation.y, translation.z );
      self.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), // rotate from Y_UNIT to the desired orientation
        new THREE.Vector3().copy( orientation ) );
    };
  }

  moleculeShapes.register( 'LonePairView', LonePairView );

  return inherit( THREE.Object3D, LonePairView, {
    /*
     * Initializes this view. Should be a fresh object, OR should have dispose() called first.
     * @public
     *
     * @param {PairGroup} group
     * @param {PairGroup} parentAtom
     * @param {Property.<boolean>} visibilityProperty
     * @returns {LonePairView} this
     */
    initialize: function( group, parentAtom, visibilityProperty ) {
      this.group = group;
      this.parentAtom = parentAtom;
      this.visibilityProperty = visibilityProperty;
      this.visibilityListener = visibilityProperty.linkAttribute( this, 'visible' );

      group.positionProperty.link( this.positionListener );
      return this;
    },

    /**
     * Disposes this view, so that it can be re-initialized later. Also adds it to the object pool.
     * @public
     */
    dispose: function() {
      this.visibilityProperty.unlink( this.visibilityListener );
      this.group.positionProperty.unlink( this.positionListener );

      // clean references
      this.group = null;
      this.parentAtom = null;
      this.visibilityProperty = null;
      this.visibilityListener = null;

      LonePairView.pool.put( this, this.renderer );
    },

    /*
     * Intersection hit-test to determine if a pointer is over the lone pair view.
     * @public
     *
     * @param {THREE.Ray} worldRay - Camera ray in world space
     * @param {boolean} isTouch - Whether expanded touch regions should be included
     * @returns {THREE.Vector3|null} - The first intersection point (in world coordinates) found if it exists, otherwise
     *                                 null. Note that we short-circuit the handling, so it may pick an intersection
     *                                 point on the opposite side - for now that's deemed an acceptable trade-off for
     *                                 performance.
     */
    intersect: function( worldRay, isTouch ) {
      var inverseMatrix = new THREE.Matrix4();
      var ray = new THREE.Ray();

      var geometry = isTouch ? touchHitTestGeometry : mouseHitTestGeometry;

      // get the ray in our local coordinate frame
      inverseMatrix.getInverse( this.shell.matrixWorld );
      ray.copy( worldRay ).applyMatrix4( inverseMatrix );

      var vertices = geometry.vertices;
      var faceCount = geometry.faces.length;

      // hit-test all faces, with early exit in case of intersection (the distance doesn't have to be exact)
      for ( var f = 0; f < faceCount; f++ ) {
        var face = geometry.faces[ f ];
        var a = vertices[ face.a ];
        var b = vertices[ face.b ];
        var c = vertices[ face.c ];
        var intersectionPoint = ray.intersectTriangle( a, b, c, false ); // don't cull
        if ( intersectionPoint !== null ) {
          return intersectionPoint.applyMatrix4( this.matrixWorld );
        }
      }

      return null;
    }
  }, {
    // @private {LocalPool}
    pool: new LocalPool( 'LonePairView', function( renderer ) {
      return new LonePairView( renderer );
    } )
  } );
} );
