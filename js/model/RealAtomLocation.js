// Copyright 2002-2014, University of Colorado Boulder

/**
 * The location of an atom in 3 dimensions, used for RealMoleculeShape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var NitroglycerinAtom = require( 'NITROGLYCERIN/Atom' );

  /**
   * @constructor
   * @param {Element} element
   * @param {Vector2} position - The initial position for the atom
   * @param {number} [lonePairCount]
   */
  function RealAtomLocation( element, position, lonePairCount ) {
    NitroglycerinAtom.call( this, element );

    this.position = position;
    this.lonePairCount = lonePairCount || 0;

    // we should be immutable
    if ( assert ) {
      Object.freeze && Object.freeze( this );
    }
  }

  return inherit( NitroglycerinAtom, RealAtomLocation );
} );
