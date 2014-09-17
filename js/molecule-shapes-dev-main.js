//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Development testing entry point
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Atom = require( 'MOLECULE_SHAPES/model/Atom' );
  var Bond = require( 'MOLECULE_SHAPES/model/Bond' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );

  return {
    Atom: Atom,
    Bond: Bond,
    PairGroup: PairGroup
  };
} );
