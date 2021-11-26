// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of an atom {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Ray3 from '../../../../../dot/js/Ray3.js';
import Sphere3 from '../../../../../dot/js/Sphere3.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import { Color } from '../../../../../scenery/js/imports.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import LocalGeometry from './LocalGeometry.js';
import LocalMaterial from './LocalMaterial.js';

const DISPLAY_RADIUS = 2;
const TOUCH_RADIUS = 3;
const NUM_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.value ? 64 : 12;
const OVERDRAW = MoleculeShapesGlobals.useWebGLProperty.value ? 0 : 0.5; // amount to extend polygons when using Canvas to avoid cracks

// renderer-local access
const localAtomGeometry = new LocalGeometry( new THREE.SphereGeometry( DISPLAY_RADIUS, NUM_SAMPLES, NUM_SAMPLES ) );

const elementLocalMaterials = {
  // filled in dynamically in getElementLocalMaterial
};

const mouseHitTestSphere = new Sphere3( Vector3.ZERO, DISPLAY_RADIUS );
const touchHitTestSphere = new Sphere3( Vector3.ZERO, TOUCH_RADIUS );

class AtomView extends THREE.Mesh {
  /*
   * @param {PairGroup} group
   * @param {THREE.Renderer} renderer - To know which geometries/materials to use for which renderer (can't share)
   * @param {LocalMaterial} localMaterial - preferably from one of AtomView's static methods/properties
   */
  constructor( group, renderer, localMaterial ) {
    super( localAtomGeometry.get( renderer ), localMaterial.get( renderer ) );

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

  /*
   * Intersection test for whether the mouse/touch is over this.
   * @public
   *
   * @param {THREE.Ray} worldRay - Camera ray in world space
   * @param {boolean} isTouch - Whether expanded touch regions should be included
   * @returns {THREE.Vector3|null} - The first intersection point (in world coordinates) if it exists, otherwise null
   */
  intersect( worldRay, isTouch ) {
    const inverseMatrix = new THREE.Matrix4();
    const ray = new THREE.Ray();

    const sphere = isTouch ? touchHitTestSphere : mouseHitTestSphere;

    // transform the ray into local coordinates
    inverseMatrix.getInverse( this.matrixWorld );
    ray.copy( worldRay ).applyMatrix4( inverseMatrix );

    const hitResult = sphere.intersect( new Ray3( new Vector3( 0, 0, 0 ).set( ray.origin ), new Vector3( 0, 0, 0 ).set( ray.direction ) ), 0.00001 );
    if ( hitResult === null ) {
      return null;
    }
    const localPoint = hitResult.hitPoint;
    return new THREE.Vector3().copy( localPoint ).applyMatrix4( this.matrixWorld );
  }

  /**
   * Returns the shared LocalMaterial for a specific Element (we don't want to have multiple LocalMaterials for the
   * same element due to memory concerns).
   * @public
   *
   * @param {NITROGLYCERIN.Element} element
   * @returns {LocalMaterial}
   */
  static getElementLocalMaterial( element ) {
    // Lazily create LocalMaterials for each element.
    // We'll want one material for each renderer-element pair, since we can't share across renderers, and we want to
    // share the material with the same element when possible.

    let localMaterial = elementLocalMaterials[ element.symbol ];
    if ( !localMaterial ) {
      localMaterial = elementLocalMaterials[ element.symbol ] = new LocalMaterial( new THREE.MeshLambertMaterial( {
        color: new Color( element.color ).toNumber(),
        overdraw: OVERDRAW
      } ) );
    }
    return localMaterial;
  }
}

// @public {LocalMaterial} - renderer-local access
AtomView.centralAtomLocalMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: OVERDRAW } ), {
  color: MoleculeShapesColors.centralAtomProperty
} );

// @public {LocalMaterial} - renderer-local access
AtomView.atomLocalMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: OVERDRAW } ), {
  color: MoleculeShapesColors.atomProperty
} );

moleculeShapes.register( 'AtomView', AtomView );

export default AtomView;