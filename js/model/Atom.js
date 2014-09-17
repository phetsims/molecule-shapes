// Copyright 2002-2014, University of Colorado Boulder

/**
 * An atom with a 3D position
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var NitroglycerinAtom = require( 'NITROGLYCERIN/Atom' );

  function Atom( element, position, lonePairCount ) {
    NitroglycerinAtom.call( this, element );

    PropertySet.call( this, {
      position: position
    } );

    this.lonePairCount = lonePairCount || 0;
  }

  return inherit( PropertySet, Atom, NitroglycerinAtom.prototype );
} );
