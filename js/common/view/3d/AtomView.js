// Copyright 2014-2019, University of Colorado Boulder

/**
 * View of an atom {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  const LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  const Ray3 = require( 'DOT/Ray3' );
  const Sphere3 = require( 'DOT/Sphere3' );
  const Vector3 = require( 'DOT/Vector3' );

  var DISPLAY_RADIUS = 2;
  var TOUCH_RADIUS = 3;
  var NUM_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.get() ? 64 : 12;
  var OVERDRAW = MoleculeShapesGlobals.useWebGLProperty.get() ? 0 : 0.5; // amount to extend polygons when using Canvas to avoid cracks

  // renderer-local access
  var localAtomGeometry = new LocalGeometry( new THREE.SphereGeometry( DISPLAY_RADIUS, NUM_SAMPLES, NUM_SAMPLES ) );

  var elementLocalMaterials = {
    // filled in dynamically in getElementLocalMaterial
  };

  var mouseHitTestSphere = new Sphere3( Vector3.ZERO, DISPLAY_RADIUS );
  var touchHitTestSphere = new Sphere3( Vector3.ZERO, TOUCH_RADIUS );

  /*
   * @param {PairGroup} group
   * @param {THREE.Renderer} renderer - To know which geometries/materials to use for which renderer (can't share)
   * @param {LocalMaterial} localMaterial - preferably from one of AtomView's static methods/properties
   */
  function AtomView( group, renderer, localMaterial ) {
    THREE.Mesh.call( this, localAtomGeometry.get( renderer ), localMaterial.get( renderer ) );

    this.group = group; // @private {PairGroup}

    if ( phet.chipper.queryParameters.showPointerAreas ) {
      if ( localMaterial !== AtomView.centralAtomLocalMaterial ) {
        this.add( new THREE.Mesh( new THREE.SphereGeometry( TOUCH_RADIUS, NUM_SAMPLES, NUM_SAMPLES ), new THREE.MeshBasicMaterial( {
          color: 0xff0000,
          transparent: true,
          opacity: 0.4,
          depthWrite: false
        } ) ) );
      }
    }
  }

  moleculeShapes.register( 'AtomView', AtomView );

  return inherit( THREE.Mesh, AtomView, {
    /*
     * Intersection test for whether the mouse/touch is over this.
     * @public
     *
     * @param {THREE.Ray} worldRay - Camera ray in world space
     * @param {boolean} isTouch - Whether expanded touch regions should be included
     * @returns {THREE.Vector3|null} - The first intersection point (in world coordinates) if it exists, otherwise null
     */
    intersect: function( worldRay, isTouch ) {
      var inverseMatrix = new THREE.Matrix4();
      var ray = new THREE.Ray();

      var sphere = isTouch ? touchHitTestSphere : mouseHitTestSphere;

      // transform the ray into local coordinates
      inverseMatrix.getInverse( this.matrixWorld );
      ray.copy( worldRay ).applyMatrix4( inverseMatrix );

      var hitResult = sphere.intersect( new Ray3( new Vector3( 0, 0, 0 ).set( ray.origin ), new Vector3( 0, 0, 0 ).set( ray.direction ) ), 0.00001 );
      if ( hitResult === null ) {
        return null;
      }
      var localPoint = hitResult.hitPoint;
      return new THREE.Vector3().copy( localPoint ).applyMatrix4( this.matrixWorld );
    }
  }, {
    // @public {LocalMaterial} - renderer-local access
    centralAtomLocalMaterial: new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: OVERDRAW } ), {
      color: MoleculeShapesColorProfile.centralAtomProperty
    } ),

    // @public {LocalMaterial} - renderer-local access
    atomLocalMaterial: new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: OVERDRAW } ), {
      color: MoleculeShapesColorProfile.atomProperty
    } ),

    /**
     * Returns the shared LocalMaterial for a specific Element (we don't want to have multiple LocalMaterials for the
     * same element due to memory concerns).
     * @public
     *
     * @param {NITROGLYCERIN.Element} element
     * @returns {LocalMaterial}
     */
    getElementLocalMaterial: function( element ) {
      // Lazily create LocalMaterials for each element.
      // We'll want one material for each renderer-element pair, since we can't share across renderers, and we want to
      // share the material with the same element when possible.

      var localMaterial = elementLocalMaterials[ element.symbol ];
      if ( !localMaterial ) {
        localMaterial = elementLocalMaterials[ element.symbol ] = new LocalMaterial( new THREE.MeshLambertMaterial( {
          color: new Color( element.color ).toNumber(),
          overdraw: OVERDRAW
        } ) );
      }
      return localMaterial;
    }
  } );
} );
