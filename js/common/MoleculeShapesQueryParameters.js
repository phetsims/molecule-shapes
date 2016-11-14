// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );

  var MoleculeShapesQueryParameters = QueryStringMachine.getAll( {

    //TODO document
    showOuterLonePairs: { type: 'flag' }
  } );

  moleculeShapes.register( 'MoleculeShapesQueryParameters', MoleculeShapesQueryParameters );

  return MoleculeShapesQueryParameters;
} );
