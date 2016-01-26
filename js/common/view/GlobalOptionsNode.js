// Copyright 2014-2015, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CheckBox = require( 'SUN/CheckBox' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );

  // strings
  var optionsShowOuterLonePairsString = require( 'string!MOLECULE_SHAPES/options.showOuterLonePairs' );
  var optionsProjectorColorsString = require( 'string!MOLECULE_SHAPES/options.projectorColors' );

  function GlobalOptionsNode( isBasicsVersion ) {
    var children = [];

    if ( !isBasicsVersion ) {
      children.push( new CheckBox( new Text( optionsShowOuterLonePairsString, { font: OptionsDialog.DEFAULT_FONT } ),
        MoleculeShapesGlobals.showOuterLonePairsProperty, {} ) );
    }
    children.push( new CheckBox( new Text( optionsProjectorColorsString, { font: OptionsDialog.DEFAULT_FONT } ),
      MoleculeShapesGlobals.projectorColorsProperty, {} ) );

    VBox.call( this, _.extend( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  moleculeShapes.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( VBox, GlobalOptionsNode );
} );