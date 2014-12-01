//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CheckBox = require( 'SUN/CheckBox' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );

  // strings
  var showOuterLonePairsString = require( 'string!MOLECULE_SHAPES/options.showOuterLonePairs' );
  var projectorColorsString = require( 'string!MOLECULE_SHAPES/options.projectorColors' );

  function GlobalOptionsNode( isBasicsVersion ) {
    var children = [];

    if ( !isBasicsVersion ) {
      children.push( new CheckBox( new Text( showOuterLonePairsString, { font: OptionsDialog.DEFAULT_FONT } ),
                                   MoleculeShapesGlobals.showOuterLonePairsProperty, {} ) );
    }
    children.push( new CheckBox( new Text( projectorColorsString, { font: OptionsDialog.DEFAULT_FONT } ),
                                 MoleculeShapesGlobals.projectorColorsProperty, {} ) );

    VBox.call( this, _.extend( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  return inherit( VBox, GlobalOptionsNode );
} );