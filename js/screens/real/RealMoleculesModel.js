//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for the 'Real' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/model/MoleculeShapesModel' );
  var RealMolecule = require( 'MOLECULE_SHAPES/model/RealMolecule' );
  var RealMoleculeShape = require( 'MOLECULE_SHAPES/model/RealMoleculeShape' );

  /**
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function RealMoleculesModel( isBasicsVersion ) {
    var startingMoleculeShape = isBasicsVersion ? RealMoleculeShape.TAB_2_BASIC_MOLECULES[0] : RealMoleculeShape.TAB_2_MOLECULES[0];
    var startingMolecule = new RealMolecule( startingMoleculeShape );

    // inherits PropertySet, these are made into properties
    MoleculeShapesModel.call( this, isBasicsVersion, {
      molecule: startingMolecule, // @override {Molecule}
      realMoleculeShape: startingMoleculeShape, // {RealMoleculeShape}
      showRealView: true // whether the "Real" or "Model" view is shown
    } );
  }

  return inherit( MoleculeShapesModel, RealMoleculesModel, {

    reset: function() {
      MoleculeShapesModel.prototype.reset.call( this );
    },

    step: function( dt ) {
      MoleculeShapesModel.prototype.step.call( this, dt );
    }
  } );
} );

