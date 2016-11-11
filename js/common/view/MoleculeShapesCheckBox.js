// Copyright 2014-2015, University of Colorado Boulder

/**
 * A CheckBox with customized color handling for Molecule Shapes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CheckBox = require( 'SUN/CheckBox' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function MoleculeShapesCheckBox( content, property, options ) {
    CheckBox.call( this, content, property, options );

    MoleculeShapesColorProfile.linkAttribute( 'checkBox', this, 'checkBoxColor' );
    MoleculeShapesColorProfile.linkAttribute( 'checkBoxBackground', this, 'checkBoxColorBackground' );
  }

  moleculeShapes.register( 'MoleculeShapesCheckBox', MoleculeShapesCheckBox );

  return inherit( CheckBox, MoleculeShapesCheckBox, {} );
} );

