//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Real Molecules' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/view/MoleculeShapesPanel' );
  var OptionsNode = require( 'MOLECULE_SHAPES/view/OptionsNode' );
  var MoleculeView = require( 'MOLECULE_SHAPES/view/3d/MoleculeView' );

  var optionsString = require( 'string!MOLECULE_SHAPES/control.options' );

  /**
   * Constructor for the RealMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function RealMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );

    this.moleculeView = new MoleculeView( model, model.molecule );
    this.threeScene.add( this.moleculeView );

    this.addChild( new MoleculeShapesPanel( optionsString, new OptionsNode( model.showLonePairsProperty, model.showBondAnglesProperty, model.isBasicsVersion ), {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10
    } ) );
  }

  return inherit( MoleculeShapesScreenView, RealMoleculesScreenView );
} );
