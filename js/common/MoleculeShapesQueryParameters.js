// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */
define( require => {
  'use strict';

  // modules
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );

  const MoleculeShapesQueryParameters = QueryStringMachine.getAll( {

    //TODO document
    showOuterLonePairs: { type: 'flag' }
  } );

  moleculeShapes.register( 'MoleculeShapesQueryParameters', MoleculeShapesQueryParameters );

  return MoleculeShapesQueryParameters;
} );
