// Copyright 2014-2019, University of Colorado Boulder

/**
 * A Checkbox with customized color handling for Molecule Shapes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @constructor
   * @param {Object} [options]
   */
  function MoleculeShapesCheckbox( content, property, options ) {
    Checkbox.call( this, content, property, options );

    MoleculeShapesColorProfile.checkboxProperty.linkAttribute( this, 'checkboxColor' );
    MoleculeShapesColorProfile.checkboxBackgroundProperty.linkAttribute( this, 'checkboxColorBackground' );
  }

  moleculeShapes.register( 'MoleculeShapesCheckbox', MoleculeShapesCheckbox );

  return inherit( Checkbox, MoleculeShapesCheckbox, {} );
} );

