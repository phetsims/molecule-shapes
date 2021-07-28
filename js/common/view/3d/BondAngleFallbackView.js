// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of the angle (sector and line) between two bonds, written in three.js so it can be displayed with Canvas instead
 * of WebGL (works for both). Less efficient that BondAngleWebGLView, since we need to update the vertices on the CPU
 * and push them over to the GPU.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import BondAngleView from './BondAngleView.js';
import LocalPool from './LocalPool.js';

const NUM_VERTICES = 24; // number of radial vertices along the edge

function createArcGeometry( vertices ) {
  const geometry = new THREE.Geometry();

  for ( let i = 0; i < vertices.length; i++ ) {
    geometry.vertices.push( vertices[ i ] );
  }
  geometry.dynamic = true; // so we can be updated

  return geometry;
}

function createSectorGeometry( vertices ) {
  const geometry = new THREE.Geometry();

  // center
  geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
  for ( let i = 0; i < vertices.length; i++ ) {
    // unclear whether concat would be supported
    geometry.vertices.push( vertices[ i ] );
  }
  // faces
  for ( let j = 0; j < vertices.length - 1; j++ ) {
    geometry.faces.push( new THREE.Face3( 0, j + 1, j + 2 ) );
  }
  geometry.dynamic = true; // so we can be updated

  return geometry;
}

class BondAngleFallbackView extends BondAngleView {
  /**
   * @param {THREE.Renderer} renderer
   */
  constructor( renderer ) {
    super();

    this.renderer = renderer; // @public {THREE.Renderer}

    // @private {Array.<THREE.Vector3>} shared vertex array between both geometries
    this.arcVertices = [];
    for ( let i = 0; i < NUM_VERTICES; i++ ) {
      this.arcVertices.push( new THREE.Vector3() );
    }

    // geometries on each instance, since we need to modify them directly
    this.arcGeometry = createArcGeometry( this.arcVertices ); // @private {THREE.Geometry}
    this.sectorGeometry = createSectorGeometry( this.arcVertices ); // @private {THREE.Geometry}

    // @private {THREE.MeshBasicMaterial}
    this.sectorMaterial = new THREE.MeshBasicMaterial( {
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      overdraw: MoleculeShapesGlobals.useWebGLProperty.value ? 0 : 0.1 // amount to extend polygons when using Canvas to avoid cracks
    } );
    MoleculeShapesGlobals.linkColor( this.sectorMaterial, MoleculeShapesColors.bondAngleSweepProperty );

    // @private {THREE.MeshBasicMaterial}
    this.arcMaterial = new THREE.LineBasicMaterial( {
      transparent: true,
      opacity: 0.7,
      depthWrite: false // don't write depth values, so we don't cause other transparent objects to render
    } );
    MoleculeShapesGlobals.linkColor( this.arcMaterial, MoleculeShapesColors.bondAngleArcProperty );

    this.sectorView = new THREE.Mesh( this.sectorGeometry, this.sectorMaterial ); // @private {THREE.Mesh}
    this.arcView = new THREE.Line( this.arcGeometry, this.arcMaterial ); // @private {THREE.Mesh}

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;

    this.add( this.sectorView );
    this.add( this.arcView );
  }

  /*
   * @public
   * @override
   *
   * @param {MoleculeShapesScreenView} screenView - Some screen-space information and transformations are needed
   * @param {Property.<boolean>} showBondAnglesProperty
   * @param {Molecule} molecule
   * @param {PairGroup} aGroup
   * @param {PairGroup} bGroup
   * @param {LabelWebGLView|LabelFallbackNode} label
   */
  initialize( screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label ) {
    super.initialize( screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label );

    return this;
  }

  /**
   * Disposes so that it can be initialized later. Puts it in the pool.
   * @override
   * @public
   */
  dispose() {
    super.dispose();

    BondAngleFallbackView.pool.put( this, this.renderer );
  }

  /**
   * @override
   * @public
   *
   * @param {Vector3} lastMidpoint - The midpoint of the last frame's bond angle arc, used to stabilize bond angles
   *                                 that are around ~180 degrees.
   * @param {Vector3} localCameraOrientation - A unit vector in the molecule's local coordiante space pointing
   *                                           to the camera.
   */
  updateView( lastMidpoint, localCameraOrientation ) {
    super.updateView( lastMidpoint, localCameraOrientation );

    this.sectorMaterial.opacity = this.viewOpacity / 2;
    this.arcMaterial.opacity = this.viewOpacity * 0.7;

    // update the vertices based on our GLSL shader
    for ( let i = 0; i < NUM_VERTICES; i++ ) {
      const ratio = i / ( NUM_VERTICES - 1 ); // zero to 1

      // map our midpoint to theta=0
      const theta = ( ratio - 0.5 ) * this.viewAngle;

      // use our basis vectors to compute the point
      const position = this.midpointUnit.times( Math.cos( theta ) ).plus( this.planarUnit.times( Math.sin( theta ) ) ).times( BondAngleView.radius );

      const vertex = this.arcVertices[ i ];
      vertex.x = position.x;
      vertex.y = position.y;
      vertex.z = position.z;
    }

    // let three.js know that the vertices need to be updated
    this.arcGeometry.verticesNeedUpdate = true;
    this.sectorGeometry.verticesNeedUpdate = true;
  }

}

// @private {LocalPool}
BondAngleFallbackView.pool = new LocalPool( 'BondAngleFallbackView', renderer => new BondAngleFallbackView( renderer ) );

moleculeShapes.register( 'BondAngleFallbackView', BondAngleFallbackView );

export default BondAngleFallbackView;