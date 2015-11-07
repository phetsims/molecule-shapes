// Copyright 2014-2015, University of Colorado Boulder

/**
 * View of a lone pair
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LonePairGeometryData = require( 'MOLECULE_SHAPES/common/data/LonePairGeometryData' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var ElectronView = require( 'MOLECULE_SHAPES/common/view/3d/ElectronView' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );
  var LocalPool = require( 'MOLECULE_SHAPES/common/view/3d/LocalPool' );

  var jsonLoader = new THREE.JSONLoader();

  // geometry used for display
  var masterShellGeometry = jsonLoader.parse( MoleculeShapesGlobals.useWebGL ? LonePairGeometryData.HIGH_DETAIL : LonePairGeometryData.LOW_DETAIL_QUADS ).geometry;

  // renderer-local access
  var localShellGeometry = new LocalGeometry( masterShellGeometry );
  var localShellMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
    transparent: true,
    opacity: 0.7,
    depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
    overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.1 // amount to extend polygons when using Canvas to avoid cracks
  } ), {
    color: MoleculeShapesColors.lonePairShellProperty
  } );

  // geometries used for hit testing (includes a larger touch hit mesh)
  var mouseHitTestGeometry = jsonLoader.parse( LonePairGeometryData.LOW_DETAIL ).geometry;
  var touchHitTestGeometry = jsonLoader.parse( LonePairGeometryData.LOW_DETAIL_EXTRUDED ).geometry;

  /*
   * @constructor
   * @param {THREE.Renderer} renderer
   */
  function LonePairView( renderer ) {
    var view = this;

    THREE.Object3D.call( this );

    this.renderer = renderer;
    this.shellGeometry = localShellGeometry.get( renderer );
    this.shellMaterial = localShellMaterial.get( renderer );

    this.shell = new THREE.Mesh( this.shellGeometry, this.shellMaterial );

    // scale for the shell geometries (for display and hit testing)
    var shellScale = 2.5;

    this.shell.scale.x = this.shell.scale.y = this.shell.scale.z = shellScale;
    this.shell.position.y = 0.001; // slight offset so three.js will z-sort the shells correctly for the transparency pass
    this.add( this.shell );

    this.electronView1 = new ElectronView( renderer );
    this.electronView2 = new ElectronView( renderer );
    this.add( this.electronView1 );
    this.add( this.electronView2 );

    this.electronView1.position.x = 0.75;
    this.electronView2.position.x = -0.75;
    this.electronView1.position.y = this.electronView2.position.y = 5;

    if ( phet.chipper.getQueryParameter( 'showPointerAreas' ) ) {
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

    // per-instance listener, so it's easier to link and unlink
    this.positionListener = function( position ) {
      var offsetFromParentAtom = position.minus( view.parentAtom.position );
      var orientation = offsetFromParentAtom.normalized();

      var translation;
      if ( offsetFromParentAtom.magnitude() > PairGroup.LONE_PAIR_DISTANCE ) {
        translation = position.minus( orientation.times( PairGroup.LONE_PAIR_DISTANCE ) );
      }
      else {
        translation = view.parentAtom.position;
      }

      view.position.set( translation.x, translation.y, translation.z );
      view.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), // rotate from Y_UNIT to the desired orientation
        new THREE.Vector3().copy( orientation ) );
    };
  }

  return inherit( THREE.Object3D, LonePairView, {
    /*
     * @param {PairGroup} group
     * @param {PairGroup} parentAtom
     * @param {Property.<boolean>} visibilityProperty
     */
    initialize: function( group, parentAtom, visibilityProperty ) {
      this.group = group;
      this.parentAtom = parentAtom;
      this.visibilityProperty = visibilityProperty;
      this.visibilityListener = visibilityProperty.linkAttribute( this, 'visible' );

      group.link( 'position', this.positionListener );

      return this;
    },

    dispose: function() {
      this.visibilityProperty.unlink( this.visibilityListener );

      // no PropertySet.unlink?
      this.group.positionProperty.unlink( this.positionListener );

      // clean references
      this.group = null;
      this.parentAtom = null;
      this.visibilityProperty = null;
      this.visibilityListener = null;

      LonePairView.pool.put( this, this.renderer );
    },

    /*
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
    pool: new LocalPool( 'LonePairView', function( renderer ) {
      return new LonePairView( renderer );
    } )
  } );
} );
