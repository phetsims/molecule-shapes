// Copyright 2014-2021, University of Colorado Boulder

/**
 * A Checkbox with customized color handling for Molecule Shapes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';

class MoleculeShapesCheckbox extends Checkbox {

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   */
  constructor( content, property, options ) {
    super( content, property, options );

    MoleculeShapesColors.checkboxProperty.linkAttribute( this, 'checkboxColor' );
    MoleculeShapesColors.checkboxBackgroundProperty.linkAttribute( this, 'checkboxColorBackground' );
  }
}

moleculeShapes.register( 'MoleculeShapesCheckbox', MoleculeShapesCheckbox );
export default MoleculeShapesCheckbox;