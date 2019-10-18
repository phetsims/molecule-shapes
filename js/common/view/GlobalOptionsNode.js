// Copyright 2014-2019, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  const OptionsDialog = require( 'JOIST/OptionsDialog' );
  const ProjectorModeCheckbox = require( 'JOIST/ProjectorModeCheckbox' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const optionsShowOuterLonePairsString = require( 'string!MOLECULE_SHAPES/options.showOuterLonePairs' );

  function GlobalOptionsNode( isBasicsVersion, options ) {

    options = merge( {
      defaultColorProfileName: 'default'
    }, options );

    const children = [];

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

    VBox.call( this, {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } );
  }

  moleculeShapes.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( VBox, GlobalOptionsNode );
} );