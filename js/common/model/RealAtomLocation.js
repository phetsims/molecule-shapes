// Copyright 2014-2015, University of Colorado Boulder

/**
 * The location of an atom in 3 dimensions, used for RealMoleculeShape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Atom = require( 'NITROGLYCERIN/Atom' );
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );

  /**
   * @constructor
   * @param {Element} element
   * @param {Vector2} position - The initial position for the atom
   * @param {number} [lonePairCount]
   */
  function RealAtomLocation( element, position, lonePairCount ) {
    Atom.call( this, element );

    this.position = position; // @public {Vector3}
    this.orientation = position.magnitude() > 0 ? position.normalized() : position.copy(); // @public {Vector3}
    this.lonePairCount = lonePairCount || 0; // @public {number} - How many external lone pairs it has.

    // we should be immutable
    if ( assert ) {
      Object.freeze && Object.freeze( this );
    }
  }

  moleculeShapes.register( 'RealAtomLocation', RealAtomLocation );

  return inherit( Atom, RealAtomLocation );
} );
