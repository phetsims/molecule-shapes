// Copyright 2002-2014, University of Colorado Boulder

/**
 * Bond between atoms
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );

  function Bond( a, b, order, length ) {
    this.a = a;
    this.b = b;
    this.order = order;
    this.length = length; // in angstroms, or 0 / undefined if there is no data
  }

  return inherit( Object, Bond, {
    toString: function() {
      return "{" + this.a.toString() + " => " + this.b.toString() + "}";
    },

    contains: function( atom ) {
      return this.a === atom || this.b === atom;
    },

    getOtherAtom: function( atom ) {
      assert && assert( this.contains( atom ) );

      return this.a === atom ? this.b : this.a;
    },

    equals: function( bond ) {
      // TODO: consider checking bond order? or is this not important?
      return this.a === bond.a && this.b === bond.b;
    }
  } );
} );
