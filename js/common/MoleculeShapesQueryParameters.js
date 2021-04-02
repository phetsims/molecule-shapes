// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */

import moleculeShapes from '../moleculeShapes.js';

const MoleculeShapesQueryParameters = QueryStringMachine.getAll( {
  // Determines the default for whether outer lone pairs are shown.
  showOuterLonePairs: { type: 'flag', public: true },

  // Added only to the 1.3 branch to support a research study, see https://github.com/phetsims/special-ops/issues/190
  research: { type: 'flag' }
} );

moleculeShapes.register( 'MoleculeShapesQueryParameters', MoleculeShapesQueryParameters );

export default MoleculeShapesQueryParameters;