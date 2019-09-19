// Copyright 2013-2017, University of Colorado Boulder

/**
 * Molecular bond between two items (representing atoms). Polymorphic, as the bond can reference any arbitrary type of
 * objects.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );

  /**
   * The two ends of the bond (a,b) should be of the same (arbitrary) type, noted as {*} in the documentation.
   *
   * @constructor
   * @param {*} a
   * @param {*} b
   * @param {number} order - The order of the bond.
   * @param {number} length - The length of the bond (in angstroms), or 0
   */
  function Bond( a, b, order, length ) {
    this.a = a; // @public {*}
    this.b = b; // @public {*}
    this.order = order; // @public {number}
    this.length = length; // @public {number}
  }

  moleculeShapes.register( 'Bond', Bond );

  return inherit( Object, Bond, {
    /**
     * For debugging aid.
     * @private
     */
    toString: function() {
      return '{' + this.a.toString() + ' => ' + this.b.toString() + '}';
    },

    /**
     * Whether this bond contains the atom-like object as one of its ends.
     * @public
     *
     * @param {*} atom
     * @returns {boolean}
     */
    contains: function( atom ) {
      return this.a === atom || this.b === atom;
    },

    /**
     * Assuming that this bond contains the atom-like object, return the other end of the bond.
     * @public
     *
     * @param {*} atom
     * @returns {*}
     */
    getOtherAtom: function( atom ) {
      assert && assert( this.contains( atom ) );

      return this.a === atom ? this.b : this.a;
    }
  } );
} );
