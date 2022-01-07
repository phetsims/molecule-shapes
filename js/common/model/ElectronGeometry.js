// Copyright 2013-2022, University of Colorado Boulder

/**
 * Contains the "optimal" molecule structures (pair group directions stored as unit vectors),
 * in an order such that higher-repulsion pair groups (lone pairs)
 * will tend to occupy the 1st slots, and bonds will occupy the later slots.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';

const geometryDiatomicString = moleculeShapesStrings.geometry.diatomic;
const geometryEmptyString = moleculeShapesStrings.geometry.empty;
const geometryLinearString = moleculeShapesStrings.geometry.linear;
const geometryOctahedralString = moleculeShapesStrings.geometry.octahedral;
const geometryTetrahedralString = moleculeShapesStrings.geometry.tetrahedral;
const geometryTrigonalBipyramidalString = moleculeShapesStrings.geometry.trigonalBipyramidal;
const geometryTrigonalPlanarString = moleculeShapesStrings.geometry.trigonalPlanar;

// Constant for the tetrahedral shape
const TETRA_CONST = Math.PI * -19.471220333 / 180;

class ElectronGeometryValue {
  /*
   * @param {string} string
   * @param {Array.<Vector3>} unitVectors - Ordered list of orientations taken by an ideal configuration
   */
  constructor( string, unitVectors ) {
    // @public {string}
    this.string = string;

    // @public {Array.<Vector3>}
    this.unitVectors = unitVectors;
  }
}

const ElectronGeometry = EnumerationDeprecated.byMap( {
  EMPTY: new ElectronGeometryValue( geometryEmptyString, [] ),
  DIATOMIC: new ElectronGeometryValue(
    geometryDiatomicString,
    [
      new Vector3( 1, 0, 0 )
    ]
  ),
  LINEAR: new ElectronGeometryValue(
    geometryLinearString,
    [
      new Vector3( 1, 0, 0 ),
      new Vector3( -1, 0, 0 )
    ]
  ),
  TRIGONAL_PLANAR: new ElectronGeometryValue(
    geometryTrigonalPlanarString,
    [
      new Vector3( 1, 0, 0 ),
      new Vector3( Math.cos( Math.PI * 2 / 3 ), Math.sin( Math.PI * 2 / 3 ), 0 ),
      new Vector3( Math.cos( Math.PI * 4 / 3 ), Math.sin( Math.PI * 4 / 3 ), 0 )
    ]
  ),
  TETRAHEDRAL: new ElectronGeometryValue(
    geometryTetrahedralString,
    [
      new Vector3( 0, 0, 1 ),
      new Vector3( Math.cos( 0 ) * Math.cos( TETRA_CONST ), Math.sin( 0 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) ),
      new Vector3( Math.cos( Math.PI * 2 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( Math.PI * 2 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) ),
      new Vector3( Math.cos( Math.PI * 4 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( Math.PI * 4 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) )
    ]
  ),
  TRIGONAL_BIPYRAMIDAL: new ElectronGeometryValue(
    geometryTrigonalBipyramidalString,
    [
      // equitorial (fills up with lone pairs first)
      new Vector3( 0, 1, 0 ),
      new Vector3( 0, Math.cos( Math.PI * 2 / 3 ), Math.sin( Math.PI * 2 / 3 ) ),
      new Vector3( 0, Math.cos( Math.PI * 4 / 3 ), Math.sin( Math.PI * 4 / 3 ) ),

      // axial
      new Vector3( 1, 0, 0 ),
      new Vector3( -1, 0, 0 )
    ]
  ),
  OCTAHEDRAL: new ElectronGeometryValue(
    geometryOctahedralString,
    [
      // opposites first
      new Vector3( 0, 0, 1 ),
      new Vector3( 0, 0, -1 ),
      new Vector3( 0, 1, 0 ),
      new Vector3( 0, -1, 0 ),
      new Vector3( 1, 0, 0 ),
      new Vector3( -1, 0, 0 )
    ]
  )
}, {
  beforeFreeze: ElectronGeometry => {
    // @public {Object}
    ElectronGeometry.byNumberOfGroupsMap = {
      0: ElectronGeometry.EMPTY,
      1: ElectronGeometry.DIATOMIC,
      2: ElectronGeometry.LINEAR,
      3: ElectronGeometry.TRIGONAL_PLANAR,
      4: ElectronGeometry.TETRAHEDRAL,
      5: ElectronGeometry.TRIGONAL_BIPYRAMIDAL,
      6: ElectronGeometry.OCTAHEDRAL
    };

    /*
     * Lookup for the configuration, based on the number of pair groups it contains.
     * @public
     *
     * @param {number} numberOfGroups - The steric number, or how many radial groups (atoms and lone pairs) are connected
     * @returns {ElectronGeometry}
     */
    ElectronGeometry.getConfiguration = numberOfGroups => {
      return ElectronGeometry.byNumberOfGroupsMap[ numberOfGroups ];
    };
  }
} );

moleculeShapes.register( 'ElectronGeometry', ElectronGeometry );
export default ElectronGeometry;