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
    showOuterLonePairs: { type: 'flag' },

    //TODO use phet.chipper.queryParameters.colorProfile
    colorProfile: {
      type: 'string',
      defaultValue: 'default',
      validValues: [ 'default', 'projector' ]
    },

    //TODO use phet.chipper.queryParameters.webgl
    webgl: {
      type: 'flag',
      defaultValue: true
    },

    //TODO use phet.chipper.queryParameters.showPointerAreas
    showPointerAreas: { type: 'flag' },

    //TODO use phet.chipper.queryParameters.dev
    dev: { type: 'flag' }
  } );

  moleculeShapes.register( 'MoleculeShapesQueryParameters', MoleculeShapesQueryParameters );

  return MoleculeShapesQueryParameters;
} );
