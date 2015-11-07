// Copyright 2014-2015, University of Colorado Boulder

/**
 * A CheckBox with customized color handling for Molecule Shapes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CheckBox = require( 'SUN/CheckBox' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function MoleculeShapesCheckBox( content, property, options ) {
    CheckBox.call( this, content, property, options );

    MoleculeShapesColors.linkAttribute( 'checkBox', this, 'checkBoxColor' );
    MoleculeShapesColors.linkAttribute( 'checkBoxBackground', this, 'checkBoxColorBackground' );
  }

  return inherit( CheckBox, MoleculeShapesCheckBox, {} );
} );

