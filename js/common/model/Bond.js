// Copyright 2013-2021, University of Colorado Boulder

/**
 * Molecular bond between two items (representing atoms). Polymorphic, as the bond can reference any arbitrary type of
 * objects.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import moleculeShapes from '../../moleculeShapes.js';

class Bond {
  /**
   * The two ends of the bond (a,b) should be of the same (arbitrary) type, noted as {*} in the documentation.
   *
   * @param {*} a
   * @param {*} b
   * @param {number} order - The order of the bond.
   * @param {number} length - The length of the bond (in angstroms), or 0
   */
  constructor( a, b, order, length ) {
    this.a = a; // @public {*}
    this.b = b; // @public {*}
    this.order = order; // @public {number}
    this.length = length; // @public {number}
  }

  /**
   * For debugging aid.
   * @private
   */
  toString() {
    return `{${this.a.toString()} => ${this.b.toString()}}`;
  }

  /**
   * Whether this bond contains the atom-like object as one of its ends.
   * @public
   *
   * @param {*} atom
   * @returns {boolean}
   */
  contains( atom ) {
    return this.a === atom || this.b === atom;
  }

  /**
   * Assuming that this bond contains the atom-like object, return the other end of the bond.
   * @public
   *
   * @param {*} atom
   * @returns {*}
   */
  getOtherAtom( atom ) {
    assert && assert( this.contains( atom ) );

    return this.a === atom ? this.b : this.a;
  }

  /**
   * @public
   *
   * @param {Array.<*>} atoms
   * @returns {Object}
   */
  toStateObject( atoms ) {
    return {
      a: atoms.indexOf( this.a ),
      b: atoms.indexOf( this.b ),
      order: this.order,
      length: this.length
    };
  }

  /**
   * @public
   *
   * @param {Object} obj
   * @param {Array.<*>} atoms
   * @returns {Bond}
   */
  static fromStateObject( obj, atoms ) {
    return new Bond( atoms[ obj.a ], atoms[ obj.b ], obj.order, obj.length );
  }
}

// @public {IOType}
Bond.BondIO = new IOType( 'BondIO', {
  valueType: Bond,
  stateSchema: {
    a: NumberIO,
    b: NumberIO,
    order: NumberIO,
    length: NumberIO
  }
} );

moleculeShapes.register( 'Bond', Bond );
export default Bond;