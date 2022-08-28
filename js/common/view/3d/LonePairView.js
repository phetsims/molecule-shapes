// Copyright 2014-2022, University of Colorado Boulder

/**
 * View of a lone pair
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../../moleculeShapes.js';
import LonePairGeometryData from '../../data/LonePairGeometryData.js';
import PairGroup from '../../model/PairGroup.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import ElectronView from './ElectronView.js';
import LocalGeometry from './LocalGeometry.js';
import LocalMaterial from './LocalMaterial.js';
import LocalPool from './LocalPool.js';

const jsonLoader = new THREE.JSONLoader();

// geometry used for display
const masterShellGeometry = jsonLoader.parse( MoleculeShapesGlobals.useWebGLProperty.value ? LonePairGeometryData.HIGH_DETAIL : LonePairGeometryData.LOW_DETAIL_QUADS ).geometry;
// renderer-local access
const localShellGeometry = new LocalGeometry( masterShellGeometry );
const localShellMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
  transparent: true,
  opacity: 0.7,
  depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
  overdraw: MoleculeShapesGlobals.useWebGLProperty.value ? 0 : 0.1 // amount to extend polygons when using Canvas to avoid cracks
} ), {
  color: MoleculeShapesColors.lonePairShellProperty
} );

// geometries used for hit testing (includes a larger touch hit mesh)
const mouseHitTestGeometry = jsonLoader.parse( LonePairGeometryData.LOW_DETAIL ).geometry;
const touchHitTestGeometry = jsonLoader.parse( LonePairGeometryData.LOW_DETAIL_EXTRUDED ).geometry;

class LonePairView extends THREE.Object3D {
  /*
   * @param {THREE.Renderer} renderer
   */
  constructor( renderer ) {

    super();

    this.renderer = renderer; // @private {THREE.Renderer}
    this.shellGeometry = localShellGeometry.get( renderer ); // @private {THREE.Geometry}
    this.shellMaterial = localShellMaterial.get( renderer ); // @private {THREE.Material}

    this.shell = new THREE.Mesh( this.shellGeometry, this.shellMaterial ); // @private {THREE.Mesh}

    // scale for the shell geometries (for display and hit testing)
    const shellScale = 2.5;

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
      const touchShell = new THREE.Mesh( touchHitTestGeometry.clone(), new THREE.MeshBasicMaterial( {
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
    this.positionListener = position => {
      const offsetFromParentAtom = position.minus( this.parentAtom.positionProperty.value );
      const orientation = offsetFromParentAtom.normalized();

      let translation;
      if ( offsetFromParentAtom.magnitude > PairGroup.LONE_PAIR_DISTANCE ) {
        translation = position.minus( orientation.times( PairGroup.LONE_PAIR_DISTANCE ) );
      }
      else {
        translation = this.parentAtom.positionProperty.value;
      }

      this.position.set( translation.x, translation.y, translation.z );
      this.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), // rotate from Y_UNIT to the desired orientation
        new THREE.Vector3().copy( orientation ) );
    };
  }

  /*
   * Initializes this view. Should be a fresh object, OR should have dispose() called first.
   * @public
   *
   * @param {PairGroup} group
   * @param {PairGroup} parentAtom
   * @param {Property.<boolean>} visibilityProperty
   * @returns {LonePairView} this
   */
  initialize( group, parentAtom, visibilityProperty ) {
    this.group = group;
    this.parentAtom = parentAtom;
    this.visibilityProperty = visibilityProperty;
    this.visibilityListener = visibilityProperty.linkAttribute( this, 'visible' );

    group.positionProperty.link( this.positionListener );
    return this;
  }

  /**
   * Disposes this view, so that it can be re-initialized later. Also adds it to the object pool.
   * @public
   */
  dispose() {
    this.visibilityListener && this.visibilityProperty.unlink( this.visibilityListener );
    this.group.positionProperty.unlink( this.positionListener );

    // clean references
    this.group = null;
    this.parentAtom = null;
    this.visibilityProperty = null;
    this.visibilityListener = null;

    LonePairView.pool.put( this, this.renderer );
  }

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
  intersect( worldRay, isTouch ) {
    const inverseMatrix = new THREE.Matrix4();
    const ray = new THREE.Ray();

    const geometry = isTouch ? touchHitTestGeometry : mouseHitTestGeometry;

    // get the ray in our local coordinate frame
    inverseMatrix.getInverse( this.shell.matrixWorld );
    ray.copy( worldRay ).applyMatrix4( inverseMatrix );

    const vertices = geometry.vertices;
    const faceCount = geometry.faces.length;

    // hit-test all faces, with early exit in case of intersection (the distance doesn't have to be exact)
    for ( let f = 0; f < faceCount; f++ ) {
      const face = geometry.faces[ f ];
      const a = vertices[ face.a ];
      const b = vertices[ face.b ];
      const c = vertices[ face.c ];
      const intersectionPoint = ray.intersectTriangle( a, b, c, false ); // don't cull
      if ( intersectionPoint !== null ) {
        return intersectionPoint.applyMatrix4( this.matrixWorld );
      }
    }

    return null;
  }

}

// @private {LocalPool}
LonePairView.pool = new LocalPool( 'LonePairView', renderer => new LonePairView( renderer ) );

moleculeShapes.register( 'LonePairView', LonePairView );

export default LonePairView;