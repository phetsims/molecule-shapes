// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of the angle (sector and arc) between two bonds. The sector is the filled-in area between two bonds, and the
 * arc is the line along the edge of the sector.
 *
 * This is an efficient but WebGL-specific implementation of the bond angles that can't be used with the Canvas fallback.
 *
 * NOTE: This does NOT include the text readout for the label
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import BondAngleView from './BondAngleView.js';
import LocalGeometry from './LocalGeometry.js';
import LocalPool from './LocalPool.js';

const RADIAL_VERTEX_COUNT = 24; // how many vertices to use along the view

/*---------------------------------------------------------------------------*
 * Geometry for the sector and arc
 *----------------------------------------------------------------------------*/

/*
 * Since we use a custom vertex shader for properly positioning and transforming our vertices, we ship our vertices
 * over in a non-standard coordinate system:
 * x: in the range [0,1], like a polar angle but scaled so 0 is at one bond direction and 1 is at the other bond direction.
 * y: the distance from the central atom (allows us to change the radius if needed)
 * z: ignored
 */

function createSectorGeometry() {
  const geometry = new THREE.Geometry();

  // first vertex (0) at the center
  geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

  // the rest of the vertices (1 to RADIAL_VERTEX_COUNT) are radial
  for ( let i = 0; i < RADIAL_VERTEX_COUNT; i++ ) {
    const ratio = i / ( RADIAL_VERTEX_COUNT - 1 ); // from 0 to 1
    geometry.vertices.push( new THREE.Vector3( ratio, BondAngleView.radius, 0 ) );
  }

  // faces (1 less than the number of radial vertices)
  for ( let j = 0; j < RADIAL_VERTEX_COUNT - 1; j++ ) {
    // we use a fan approach, first vertex is always the first (center) vertex, the other two are radial
    geometry.faces.push( new THREE.Face3( 0, j + 1, j + 2 ) );
  }

  return geometry;
}

function createArcGeometry() {
  const geometry = new THREE.Geometry();

  // radial vertices only
  for ( let i = 0; i < RADIAL_VERTEX_COUNT; i++ ) {
    const ratio = i / ( RADIAL_VERTEX_COUNT - 1 ); // from 0 to 1
    geometry.vertices.push( new THREE.Vector3( ratio, BondAngleView.radius, 0 ) );
  }

  return geometry;
}

// handles to get renderer-specific copies of the geometry
const localSectorGeometry = new LocalGeometry( createSectorGeometry() );
const localArcGeometry = new LocalGeometry( createArcGeometry() );

/*---------------------------------------------------------------------------*
 * GLSL Shader for the sector and arc
 *----------------------------------------------------------------------------*/

/*
 * We use a vertex shader that allows us to modify the bond angle's start and end points in a much faster way
 * (by changing uniforms) rather than recomputing all of the points on the CPU and shipping that to the GPU every
 * frame.
 *
 * midpointUnit is a unit vector from the center of the atom to the midpoint of the bond view's arc, and planarUnit
 * is a unit vector perpendicular to midpointUnit such that they both form a basis for the plane of our view.
 */
const vertexShader = [
  'uniform float angle;',
  'uniform vec3 midpointUnit;',
  'uniform vec3 planarUnit;',

  'void main() {',
  // Since our X coordinate is from [0,1], we map it to [-angle/2, angle/2] so that the midpoint (0.5) maps to
  // an angle of 0.
  '  float theta = ( position.x - 0.5 ) * angle;',
  // Use our basis vectors to compute the point
  '  vec3 point = position.y * ( cos( theta ) * midpointUnit + sin( theta ) * planarUnit );',
  // Standard THREE.js uniforms provided to transform the point into the correct place
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4( point, 1.0 );',
  '}'
].join( '\n' );

const fragmentShader = [
  'uniform float opacity;',
  'uniform vec3 color;',

  'void main() {',
  '  gl_FragColor = vec4( color, opacity );',
  '}'
].join( '\n' );

// "prototype" uniforms object. Deep copies will be made for each view since they need to change independently.
// This uses three.js's uniform format and types, see https://github.com/mrdoob/three.js/wiki/Uniforms-types
const uniforms = {
  opacity: {
    type: 'f',
    value: 0.5
  },
  color: {
    type: '3f',
    value: [ 1, 1, 1 ]
  },
  angle: {
    type: 'f',
    value: Math.PI / 2
  },
  midpointUnit: {
    type: '3f',
    value: [ 0, 1, 0 ]
  },
  planarUnit: {
    type: '3f',
    value: [ 1, 0, 0 ]
  }
};

class BondAngleWebGLView extends BondAngleView {
  /**
   * @param {THREE.Renderer} renderer
   */
  constructor( renderer ) {
    assert && assert( MoleculeShapesGlobals.useWebGLProperty.value );
    super();

    this.renderer = renderer; // @private {THREE.Renderer}
    this.arcGeometry = localArcGeometry.get( renderer ); // @private {THREE.Geometry}
    this.sectorGeometry = localSectorGeometry.get( renderer ); // @private {THREE.Geometry}

    // @private {THREE.ShaderMaterial} - We require one material per view so we can change the uniforms independently.
    this.sectorMaterial = new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true, // render in three.js' transparency pass
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse( JSON.stringify( uniforms ) ) // cheap deep copy
    } );
    // set and update our color
    this.sweepColorListener = color => {
      this.sectorMaterial.uniforms.color.value = [ color.r / 255, color.g / 255, color.b / 255 ];
    };
    MoleculeShapesColors.bondAngleSweepProperty.link( this.sweepColorListener );

    // @private {THREE.ShaderMaterial} - We require one material per view so we can change the uniforms independently
    // NOTE: we don't seem to be able to use the same material for rendering both the sector and arc
    this.arcMaterial = new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true, // render in three.js' transparency pass
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse( JSON.stringify( uniforms ) ) // cheap deep copy
    } );
    // set and update our color
    this.arcColorListener = color => {
      this.arcMaterial.uniforms.color.value = [ color.r / 255, color.g / 255, color.b / 255 ];
    };
    MoleculeShapesColors.bondAngleArcProperty.link( this.arcColorListener );

    this.sectorView = new THREE.Mesh( this.sectorGeometry, this.sectorMaterial ); // @private {THREE.Mesh}
    this.arcView = new THREE.Line( this.arcGeometry, this.arcMaterial ); // @private {THREE.Mesh}

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;

    this.add( this.sectorView );
    this.add( this.arcView );
  }

  /*
   * @override
   * @public
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
   * Disposes this, so it goes to the pool and can be re-initialized.
   * @override
   * @public
   */
  dispose() {
    super.dispose();

    BondAngleWebGLView.pool.put( this, this.renderer );
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

    this.sectorMaterial.uniforms.opacity.value = this.viewOpacity * 0.5;
    this.arcMaterial.uniforms.opacity.value = this.viewOpacity * 0.7;

    this.sectorMaterial.uniforms.angle.value = this.viewAngle;
    this.arcMaterial.uniforms.angle.value = this.viewAngle;

    // vector uniforms in three.js use arrays
    const midpointUnitArray = [ this.midpointUnit.x, this.midpointUnit.y, this.midpointUnit.z ];
    const planarUnitArray = [ this.planarUnit.x, this.planarUnit.y, this.planarUnit.z ];

    this.sectorMaterial.uniforms.midpointUnit.value = midpointUnitArray;
    this.arcMaterial.uniforms.midpointUnit.value = midpointUnitArray;

    this.sectorMaterial.uniforms.planarUnit.value = planarUnitArray;
    this.arcMaterial.uniforms.planarUnit.value = planarUnitArray;
  }
}

// @private {LocalPool}
BondAngleWebGLView.pool = new LocalPool( 'BondAngleWebGLView', renderer => new BondAngleWebGLView( renderer ) );

moleculeShapes.register( 'BondAngleWebGLView', BondAngleWebGLView );

export default BondAngleWebGLView;
