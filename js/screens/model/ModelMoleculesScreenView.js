//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var MoleculeView = require( 'MOLECULE_SHAPES/view/3d/MoleculeView' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );

  /**
   * Constructor for the ModelMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function ModelMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );

    this.moleculeView = new MoleculeView( model, model.molecule );
    this.threeScene.add( this.moleculeView );

    // molecule setup
    var molecule = model.molecule;

    // start with two single bonds
    // var centralAtom = new PairGroup( new Vector3(), false, false );
    // molecule.addCentralAtom( centralAtom );
    // molecule.addGroupAndBond( new PairGroup( new Vector3( 8, 0, 3 ).normalized().times( PairGroup.BONDED_PAIR_DISTANCE ), false, false ), centralAtom, 1 );
    // var v = new Vector3( 2, 8, -5 );
    // molecule.addGroupAndBond( new PairGroup( v.normalized().times( PairGroup.BONDED_PAIR_DISTANCE ), false, false ), centralAtom, 1 );
  }

  return inherit( MoleculeShapesScreenView, ModelMoleculesScreenView, {

  } );
} );
