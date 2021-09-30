// Copyright 2016-2021, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */

import moleculeShapes from '../moleculeShapes.js';

const MoleculeShapesQueryParameters = QueryStringMachine.getAll( {
  // Determines the default for whether outer lone pairs are shown.
  showOuterLonePairs: { type: 'flag', public: true },

  // Constrains the maximum number of connections to the central atom allowed
  maxConnections: {
    type: 'number',
    defaultValue: 6,
    public: true
  }
} );

moleculeShapes.register( 'MoleculeShapesQueryParameters', MoleculeShapesQueryParameters );

export default MoleculeShapesQueryParameters;