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
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/model/VSEPRMolecule' );

  /**
   * @constructor
   */
  function ModelMoleculesModel( isBasicsVersion ) {
    var model = this;

    // inherits PropertySet, these are made into properties
    MoleculeShapesModel.call( this, isBasicsVersion, {
      molecule: new VSEPRMolecule(),
      addSingleBondEnabled: true,
      addDoubleBondEnabled: true,
      addTripleBondEnabled: true,
      addLonePairEnabled: true
    } );

    // when the molecule is made empty, make sure to show lone pairs again (will allow us to drag out new ones)
    this.molecule.on( 'bondChanged', function() {
      if ( model.molecule.getRadialLonePairs.length === 0 ) {
        model.showLonePairs = true;
      }
    } );
  }

  return inherit( MoleculeShapesModel, ModelMoleculesModel, {

    reset: function() {
      MoleculeShapesModel.prototype.reset.call( this );
    },

    step: function( dt ) {
      MoleculeShapesModel.prototype.step.call( this, dt );
    }
  } );
} );
