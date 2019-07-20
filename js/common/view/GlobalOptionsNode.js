// Copyright 2014-2019, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Checkbox = require( 'SUN/Checkbox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var ProjectorModeCheckbox = require( 'JOIST/ProjectorModeCheckbox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var optionsShowOuterLonePairsString = require( 'string!MOLECULE_SHAPES/options.showOuterLonePairs' );

  function GlobalOptionsNode( isBasicsVersion, options ) {

    options = _.extend( {
      defaultColorProfileName: 'default'
    }, options );

    var children = [];

    if ( !isBasicsVersion ) {
      children.push( new Checkbox( new Text( optionsShowOuterLonePairsString, {
          font: OptionsDialog.DEFAULT_FONT,
          maxWidth: 350
        } ),
        MoleculeShapesGlobals.showOuterLonePairsProperty, {} ) );
    }

    children.push( new ProjectorModeCheckbox( MoleculeShapesColorProfile, {
      defaultColorProfileName: options.defaultColorProfileName
    } ) );

    VBox.call( this, _.extend( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  moleculeShapes.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( VBox, GlobalOptionsNode );
} );