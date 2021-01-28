// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */

import moleculeShapes from '../moleculeShapes.js';

const MoleculeShapesQueryParameters = QueryStringMachine.getAll( {
  // Determines the default for whether outer lone pairs are shown.
  showOuterLonePairs: { type: 'flag', public: true }
} );

moleculeShapes.register( 'MoleculeShapesQueryParameters', MoleculeShapesQueryParameters );

export default MoleculeShapesQueryParameters;