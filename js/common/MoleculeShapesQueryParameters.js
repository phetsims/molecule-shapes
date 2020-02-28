// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */

import moleculeShapes from '../moleculeShapes.js';

const MoleculeShapesQueryParameters = QueryStringMachine.getAll( {

  //TODO document
  showOuterLonePairs: { type: 'flag' }
} );

moleculeShapes.register( 'MoleculeShapesQueryParameters', MoleculeShapesQueryParameters );

export default MoleculeShapesQueryParameters;