// Copyright 2013-2023, University of Colorado Boulder

/**
 * Contains the "optimal" molecule structures (pair group directions stored as unit vectors),
 * in an order such that higher-repulsion pair groups (lone pairs)
 * will tend to occupy the 1st slots, and bonds will occupy the later slots.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesStrings from '../../MoleculeShapesStrings.js';

// Constant for the tetrahedral shape
const TETRA_CONST = Math.PI * -19.471220333 / 180;

class ElectronGeometryValue {
  /*
   * @param {TReadOnlyProperty<string>} stringProperty
   * @param {Array.<Vector3>} unitVectors - Ordered list of orientations taken by an ideal configuration
   */
  constructor( stringProperty, unitVectors ) {
    // @public {TReadOnlyProperty<string>}
    this.stringProperty = stringProperty;

    // @public {Array.<Vector3>}
    this.unitVectors = unitVectors;
  }
}

// Global place for the empty electron geometry string. It's not a translated string anymore, see https://github.com/phetsims/rosetta/issues/388
export const emptyElectronGeometryStringProperty = new StringProperty( '', {
  // TODO: instrumented because of TinyForwardingProperty's assertion that we can't switch to uninstrumented Properties
  // See https://github.com/phetsims/rosetta/issues/388
  tandem: Tandem.GLOBAL_MODEL.createTandem( 'emptyElectronGeometryStringProperty' ),
  phetioState: false,
  phetioFeatured: false,
  phetioDocumentation: 'Should only be the empty string',
  phetioReadOnly: true
} );

const ElectronGeometry = EnumerationDeprecated.byMap( {
  EMPTY: new ElectronGeometryValue( emptyElectronGeometryStringProperty, [] ),
  DIATOMIC: new ElectronGeometryValue(
    MoleculeShapesStrings.geometry.diatomicStringProperty,
    [
      new Vector3( 1, 0, 0 )
    ]
  ),
  LINEAR: new ElectronGeometryValue(
    MoleculeShapesStrings.geometry.linearStringProperty,
    [
      new Vector3( 1, 0, 0 ),
      new Vector3( -1, 0, 0 )
    ]
  ),
  TRIGONAL_PLANAR: new ElectronGeometryValue(
    MoleculeShapesStrings.geometry.trigonalPlanarStringProperty,
    [
      new Vector3( 1, 0, 0 ),
      new Vector3( Math.cos( Math.PI * 2 / 3 ), Math.sin( Math.PI * 2 / 3 ), 0 ),
      new Vector3( Math.cos( Math.PI * 4 / 3 ), Math.sin( Math.PI * 4 / 3 ), 0 )
    ]
  ),
  TETRAHEDRAL: new ElectronGeometryValue(
    MoleculeShapesStrings.geometry.tetrahedralStringProperty,
    [
      new Vector3( 0, 0, 1 ),
      new Vector3( Math.cos( 0 ) * Math.cos( TETRA_CONST ), Math.sin( 0 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) ),
      new Vector3( Math.cos( Math.PI * 2 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( Math.PI * 2 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) ),
      new Vector3( Math.cos( Math.PI * 4 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( Math.PI * 4 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) )
    ]
  ),
  TRIGONAL_BIPYRAMIDAL: new ElectronGeometryValue(
    MoleculeShapesStrings.geometry.trigonalBipyramidalStringProperty,
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
    MoleculeShapesStrings.geometry.octahedralStringProperty,
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