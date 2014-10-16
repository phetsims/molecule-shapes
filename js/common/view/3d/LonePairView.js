// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of a lone pair {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var LonePairGeometryData = require( 'MOLECULE_SHAPES/common/data/LonePairGeometryData' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var ElectronView = require( 'MOLECULE_SHAPES/common/view/3d/ElectronView' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );

  var jsonLoader = new THREE.JSONLoader();

  var masterShellGeometry = jsonLoader.parse( LonePairGeometryData.highDetail ).geometry;

  var localShellGeometry = new LocalGeometry( masterShellGeometry );
  var localShellMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
    transparent: true,
    opacity: 0.7,
    depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
    overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.1
  } ), {
    color: MoleculeShapesColors.lonePairShellProperty,
    ambient: MoleculeShapesColors.lonePairShellProperty
  } );

  var mouseHitTestGeometry = jsonLoader.parse( LonePairGeometryData.lowDetail ).geometry;
  var touchHitTestGeometry = jsonLoader.parse( LonePairGeometryData.lowDetailExtruded ).geometry;

  function LonePairView( renderer ) {
    THREE.Object3D.call( this );

    this.shellGeometry = localShellGeometry.get( renderer );
    this.shellMaterial = localShellMaterial.get( renderer );

    this.shell = new THREE.Mesh( this.shellGeometry, this.shellMaterial );

    this.shell.scale.x = this.shell.scale.y = this.shell.scale.z = 2.5;
    this.shell.position.y = 0.001; // slight offset so three.js will z-sort the shells correctly for the transparency pass
    this.add( this.shell );

    // refactor!
    var electronScale = 2.5;

    this.electronView1 = new ElectronView( renderer );
    this.electronView2 = new ElectronView( renderer );
    this.add( this.electronView1 );
    this.add( this.electronView2 );
    this.electronView1.scale.x = this.electronView1.scale.y = this.electronView1.scale.z = 2.5;
    this.electronView2.scale.x = this.electronView2.scale.y = this.electronView2.scale.z = 2.5;

    this.electronView1.position.x = 0.3 * electronScale;
    this.electronView2.position.x = -0.3 * electronScale;
    this.electronView1.position.y = this.electronView2.position.y = 2 * electronScale;
  }

  return inherit( THREE.Object3D, LonePairView, {
    dispose: function() {
      this.electronView1.dispose();
      this.electronView2.dispose();
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

      inverseMatrix.getInverse( this.shell.matrixWorld );
      ray.copy( worldRay ).applyMatrix4( inverseMatrix );

      var vertices = geometry.vertices;
      var faceCount = geometry.faces.length;

      for ( var f = 0; f < faceCount; f++ ) {
        var face = geometry.faces[f];
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
  } );
} );
