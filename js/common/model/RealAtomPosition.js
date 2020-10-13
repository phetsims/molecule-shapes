// Copyright 2014-2020, University of Colorado Boulder

/**
 * The position of an atom in 3 dimensions, used for RealMoleculeShape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Atom from '../../../../nitroglycerin/js/Atom.js';
import moleculeShapes from '../../moleculeShapes.js';

class RealAtomPosition extends Atom {
  /**
   * @param {Element} element
   * @param {Vector2} position - The initial position for the atom
   * @param {number} [lonePairCount]
   */
  constructor( element, position, lonePairCount ) {
    super( element );

    this.position = position; // @public {Vector3}
    this.orientation = position.magnitude > 0 ? position.normalized() : position.copy(); // @public {Vector3}
    this.lonePairCount = lonePairCount || 0; // @public {number} - How many external lone pairs it has.

    // we should be immutable
    if ( assert ) {
      Object.freeze && Object.freeze( this );
    }
  }
}

moleculeShapes.register( 'RealAtomPosition', RealAtomPosition );
export default RealAtomPosition;
