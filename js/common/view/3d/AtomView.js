// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an atom {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Sphere3 = require( 'DOT/Sphere3' );
  var Ray3 = require( 'DOT/Ray3' );
  var Color = require( 'SCENERY/util/Color' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );

  var RADIUS = 2;
  var TOUCH_RADIUS = 3;

  var numSamples = MoleculeShapesGlobals.useWebGL ? 64 : 12;
  var localBondGeometry = new LocalGeometry( new THREE.SphereGeometry( RADIUS, numSamples, numSamples ) );

  var overdraw = MoleculeShapesGlobals.useWebGL ? 0 : 0.5;
  var elementLocalMaterials = {
    // filled in dynamically in getElementLocalMaterial
  };

  var mouseHitTestSphere = new Sphere3( Vector3.ZERO, RADIUS );
  var touchHitTestSphere = new Sphere3( Vector3.ZERO, TOUCH_RADIUS );

  /*
   * @param {LocalMaterial} localMaterial - preferably from one of AtomView's static methods/properties
   */
  function AtomView( renderer, localMaterial ) {
    THREE.Mesh.call( this, localBondGeometry.get( renderer ), localMaterial.get( renderer ) );
  }

  return inherit( THREE.Mesh, AtomView, {
    dispose: function() {

    },

    /*
     * @param {THREE.Ray} worldRay - Camera ray in world space
     * @param {boolean} isTouch - Whether expanded touch regions should be included
     * @returns {THREE.Vector3|null} - The first intersection point (in world coordinates) if it exists, otherwise null
     */
    intersect: function( worldRay, isTouch ) {
      var inverseMatrix = new THREE.Matrix4();
      var ray = new THREE.Ray();

      var sphere = isTouch ? touchHitTestSphere : mouseHitTestSphere;

      inverseMatrix.getInverse( this.matrixWorld );
      ray.copy( worldRay ).applyMatrix4( inverseMatrix );

      var hitResult = sphere.intersect( new Ray3( new Vector3().set( ray.origin ), new Vector3().set( ray.direction ) ), 0.00001 );
      if ( hitResult === null ) {
        return null;
      }
      var localPoint = hitResult.hitPoint;
      return new THREE.Vector3( localPoint.x, localPoint.y, localPoint.z ).applyMatrix4( this.matrixWorld );
    }
  }, {
    centralAtomLocalMaterial: new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: overdraw } ), {
      color: MoleculeShapesColors.centralAtomProperty,
      ambient: MoleculeShapesColors.centralAtomProperty
    } ),
    atomLocalMaterial: new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: overdraw } ), {
      color: MoleculeShapesColors.atomProperty,
      ambient: MoleculeShapesColors.atomProperty
    } ),
    getElementLocalMaterial: function( element ) {
      var localMaterial = elementLocalMaterials[element.symbol];
      if ( !localMaterial ) {
        localMaterial = elementLocalMaterials[element.symbol] = new LocalMaterial( new THREE.MeshLambertMaterial( {
          color: new Color( element.color ).toNumber(),
          ambient: new Color( element.color ).toNumber(),
          overdraw: overdraw
        } ) );
      }
      return localMaterial;
    }
  } );
} );
