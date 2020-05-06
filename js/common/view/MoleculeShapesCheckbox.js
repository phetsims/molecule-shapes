// Copyright 2014-2020, University of Colorado Boulder

/**
 * A Checkbox with customized color handling for Molecule Shapes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../../../phet-core/js/inherit.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';

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
inherit( Checkbox, MoleculeShapesCheckbox );
export default MoleculeShapesCheckbox;