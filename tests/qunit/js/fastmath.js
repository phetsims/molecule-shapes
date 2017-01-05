// Copyright 2002-2014, University of Colorado Boulder

/**
 * Tests for the FastMath type used in Molecule Shapes for speedy matrix/vector operations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

(function() {
  'use strict';

  module( 'Molecule Shapes: FastMath' );

  function approxEqual( a, b, msg ) {
    ok( Math.abs( a - b ) < 0.0001, msg );
  }

  function approxEqualArray( arr, barr, msg ) {
    for ( var i = 0; i < arr.length; i++ ) {
      approxEqual( arr[ i ], barr[ i ], msg + ': index ' + i );
    }
  }

  test( 'FastMath 3x3 mults', function() {
    var a = new ms.FastMath.Array( [ 1, 2, 7, 5, 2, 6, -1, -5, 4 ] ); // a:= {{1, 2, 7}, {5, 2, 6}, {-1, -5, 4}}
    var b = new ms.FastMath.Array( [ 4, 3, 1, -7, 2, -1, -1, 0, -2 ] ); // b:= {{4, 3, 1}, {-7, 2, -1}, {-1, 0, -2}}
    var c = new ms.FastMath.Array( 9 );

    ms.FastMath.mult3( a, b, c );
    approxEqualArray( c, [ -17, 7, -15, 0, 19, -9, 27, -13, -4 ], 'mult3' );

    ms.FastMath.mult3LeftTranspose( a, b, c );
    approxEqualArray( c, [ -30, 13, -2, -1, 10, 10, -18, 33, -7 ], 'mult3LeftTranspose' );
    ms.FastMath.mult3RightTranspose( a, b, c );
    approxEqualArray( c, [ 17, -10, -15, 32, -37, -17, -15, -7, -7 ], 'mult3RightTranspose' );
    ms.FastMath.mult3BothTranspose( a, b, c );
    approxEqualArray( c, [ 18, 4, 1, 9, -5, 8, 50, -41, -15 ], 'mult3BothTranspose' );
  } );

  test( 'FastMath optimized Givens rotation equivalence', function() {
    var FastMath = ms.FastMath;

    var a = new ms.FastMath.Array( [ 1, 2, 7, 5, 2, 6, -1, -5, 4 ] );
    var normal = new ms.FastMath.Array( 9 );
    var accel = new ms.FastMath.Array( 9 );
    var givens = new ms.FastMath.Array( 9 );

    var cos = Math.cos( Math.PI / 6 );
    var sin = Math.sin( Math.PI / 6 );

    FastMath.set3( a, normal );
    FastMath.set3( a, accel );
    approxEqualArray( normal, accel, 'sanity check 1' );
    approxEqualArray( a, accel, 'sanity check 2' );

    // left mult 0,1
    FastMath.setGivens3( givens, cos, sin, 0, 1 );
    FastMath.mult3( givens, normal, normal );
    FastMath.preMult3Givens( accel, cos, sin, 0, 1 );
    approxEqualArray( normal, accel, 'left mult 0,1' );

    // left mult 0,2
    FastMath.setGivens3( givens, cos, sin, 0, 2 );
    FastMath.mult3( givens, normal, normal );
    FastMath.preMult3Givens( accel, cos, sin, 0, 2 );
    approxEqualArray( normal, accel, 'left mult 0,2' );

    // left mult 1,2
    FastMath.setGivens3( givens, cos, sin, 1, 2 );
    FastMath.mult3( givens, normal, normal );
    FastMath.preMult3Givens( accel, cos, sin, 1, 2 );
    approxEqualArray( normal, accel, 'left mult 1,2' );

    // right mult 0,1
    FastMath.setGivens3( givens, cos, sin, 0, 1 );
    FastMath.mult3RightTranspose( normal, givens, normal );
    FastMath.postMult3Givens( accel, cos, sin, 0, 1 );
    approxEqualArray( normal, accel, 'right mult 0,1' );

    // right mult 0,2
    FastMath.setGivens3( givens, cos, sin, 0, 2 );
    FastMath.mult3RightTranspose( normal, givens, normal );
    FastMath.postMult3Givens( accel, cos, sin, 0, 2 );
    approxEqualArray( normal, accel, 'right mult 0,2' );

    // right mult 1,2
    FastMath.setGivens3( givens, cos, sin, 1, 2 );
    FastMath.mult3RightTranspose( normal, givens, normal );
    FastMath.postMult3Givens( accel, cos, sin, 1, 2 );
    approxEqualArray( normal, accel, 'right mult 1,2' );
  } );

  test( 'FastMath SVD', function() {
    var FastMath = ms.FastMath;

    var a = new ms.FastMath.Array( [ 1, 2, 7, 5, 2, 6, -1, -5, 4 ] );
    var u = new ms.FastMath.Array( 9 );
    var sigma = new ms.FastMath.Array( 9 );
    var v = new ms.FastMath.Array( 9 );

    FastMath.svd3( a, 20, u, sigma, v );

    var c = new ms.FastMath.Array( 9 );

    // c = U * Sigma * V^T
    FastMath.mult3( u, sigma, c );
    FastMath.mult3RightTranspose( c, v, c );

    approxEqualArray( a, c, 'SVD composes' );

    approxEqualArray( sigma, [ sigma[ 0 ], 0, 0, 0, sigma[ 4 ], 0, 0, 0, sigma[ 8 ] ], 'Diagonal matrix should be diagonal' );

    FastMath.mult3RightTranspose( u, u, c );
    approxEqualArray( c, [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], 'U should be unitary' );

    FastMath.mult3RightTranspose( v, v, c );
    approxEqualArray( c, [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], 'V should be unitary' );

    approxEqual( FastMath.det3( u ), 1, 'U should be a rotation matrix with the current customs' );
    approxEqual( FastMath.det3( v ), 1, 'V should be a rotation matrix with the current customs' );
  } );
})();
