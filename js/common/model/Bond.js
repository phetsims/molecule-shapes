// Copyright 2013-2014, University of Colorado Boulder

/**
 * Molecular bond between two items (representing atoms)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   * @param {*} a
   * @param {*} b
   * @param {number} order - The order of the bond.
   * @param {number} length - The length of the bond (in angstroms), or 0
   */
  function Bond( a, b, order, length ) {
    this.a = a;
    this.b = b;
    this.order = order;
    this.length = length;
  }

  return inherit( Object, Bond, {
    toString: function() {
      return '{' + this.a.toString() + ' => ' + this.b.toString() + '}';
    },

    contains: function( atom ) {
      return this.a === atom || this.b === atom;
    },

    getOtherAtom: function( atom ) {
      assert && assert( this.contains( atom ) );

      return this.a === atom ? this.b : this.a;
    }
  } );
} );
