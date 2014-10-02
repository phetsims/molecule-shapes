//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/model/MoleculeShapesModel' );

  /**
   * @constructor
   */
  function ModelMoleculesModel( isBasicsVersion ) {

    // inherits PropertySet, these are made into properties
    MoleculeShapesModel.call( this, isBasicsVersion, {
      addSingleBondEnabled: true,
      addDoubleBondEnabled: true,
      addTripleBondEnabled: true,
      addLonePairEnabled: true
    } );
  }

  return inherit( MoleculeShapesModel, ModelMoleculesModel, {

    reset: function() {
      MoleculeShapesModel.call( this );
    },

    step: function( dt ) {
      MoleculeShapesModel.call( this, dt );
    }
  } );
} );
