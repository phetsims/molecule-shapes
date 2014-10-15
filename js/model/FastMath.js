// Copyright 2002-2014, University of Colorado Boulder

/**
 * Fast (mostly 3x3 matrix) computations at the lower level needed for Molecule Shapes' model.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  /*
   * Matrices are stored with row-major indices. For example, for a 3x3:
   * [0] [1] [2]
   * [3] [4] [5]
   * [6] [7] [8]
   */

   var FastMathArray = window.Float64Array || Array;

   // a matrix used in FastMath SVD computations
   var scratchGivens = new FastMathArray( 9 );
   var SQRT_HALF = Math.sqrt( 0.5 );

   return {
    Array: FastMathArray,

    /*---------------------------------------------------------------------------*
    * 3x3 matrix math
    *----------------------------------------------------------------------------*/

    // 0-indexed rows and columns
    index3: function( row, column ) {
      return 3 * row + column;
    },

    // transpose( matrix )
    transpose3: function( matrix, result ) {
      var m1 = matrix[3];
      var m2 = matrix[6];
      var m3 = matrix[1];
      var m5 = matrix[7];
      var m6 = matrix[2];
      var m7 = matrix[5];
      result[0] = matrix[0];
      result[1] = m1;
      result[2] = m2;
      result[3] = m3;
      result[4] = matrix[4];
      result[5] = m5;
      result[6] = m6;
      result[7] = m7;
      result[8] = matrix[8];
    },

    det3: function( matrix ) {
      return matrix[0] * matrix[4] * matrix[8] + matrix[1] * matrix[5] * matrix[6] +
             matrix[2] * matrix[3] * matrix[7] - matrix[2] * matrix[4] * matrix[6] -
             matrix[1] * matrix[3] * matrix[8] - matrix[0] * matrix[5] * matrix[7];
    },

    // left * right
    mult3: function( left, right, result ) {
      var m0 = left[0] * right[0] + left[1] * right[3] + left[2] * right[6];
      var m1 = left[0] * right[1] + left[1] * right[4] + left[2] * right[7];
      var m2 = left[0] * right[2] + left[1] * right[5] + left[2] * right[8];
      var m3 = left[3] * right[0] + left[4] * right[3] + left[5] * right[6];
      var m4 = left[3] * right[1] + left[4] * right[4] + left[5] * right[7];
      var m5 = left[3] * right[2] + left[4] * right[5] + left[5] * right[8];
      var m6 = left[6] * right[0] + left[7] * right[3] + left[8] * right[6];
      var m7 = left[6] * right[1] + left[7] * right[4] + left[8] * right[7];
      var m8 = left[6] * right[2] + left[7] * right[5] + left[8] * right[8];
      result[0] = m0;
      result[1] = m1;
      result[2] = m2;
      result[3] = m3;
      result[4] = m4;
      result[5] = m5;
      result[6] = m6;
      result[7] = m7;
      result[8] = m8;
    },

    // transpose( left ) * right
    mult3LeftTranspose: function( left, right, result ) {
      var m0 = left[0] * right[0] + left[3] * right[3] + left[6] * right[6];
      var m1 = left[0] * right[1] + left[3] * right[4] + left[6] * right[7];
      var m2 = left[0] * right[2] + left[3] * right[5] + left[6] * right[8];
      var m3 = left[1] * right[0] + left[4] * right[3] + left[7] * right[6];
      var m4 = left[1] * right[1] + left[4] * right[4] + left[7] * right[7];
      var m5 = left[1] * right[2] + left[4] * right[5] + left[7] * right[8];
      var m6 = left[2] * right[0] + left[5] * right[3] + left[8] * right[6];
      var m7 = left[2] * right[1] + left[5] * right[4] + left[8] * right[7];
      var m8 = left[2] * right[2] + left[5] * right[5] + left[8] * right[8];
      result[0] = m0;
      result[1] = m1;
      result[2] = m2;
      result[3] = m3;
      result[4] = m4;
      result[5] = m5;
      result[6] = m6;
      result[7] = m7;
      result[8] = m8;
    },

    //  left * transpose( right )
    mult3RightTranspose: function( left, right, result ) {
      var m0 = left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
      var m1 = left[0] * right[3] + left[1] * right[4] + left[2] * right[5];
      var m2 = left[0] * right[6] + left[1] * right[7] + left[2] * right[8];
      var m3 = left[3] * right[0] + left[4] * right[1] + left[5] * right[2];
      var m4 = left[3] * right[3] + left[4] * right[4] + left[5] * right[5];
      var m5 = left[3] * right[6] + left[4] * right[7] + left[5] * right[8];
      var m6 = left[6] * right[0] + left[7] * right[1] + left[8] * right[2];
      var m7 = left[6] * right[3] + left[7] * right[4] + left[8] * right[5];
      var m8 = left[6] * right[6] + left[7] * right[7] + left[8] * right[8];
      result[0] = m0;
      result[1] = m1;
      result[2] = m2;
      result[3] = m3;
      result[4] = m4;
      result[5] = m5;
      result[6] = m6;
      result[7] = m7;
      result[8] = m8;
    },

    //  transpose( left ) * transpose( right ) === transpose( right * left )
    mult3BothTranspose: function( left, right, result ) {
      var m0 = left[0] * right[0] + left[3] * right[1] + left[6] * right[2];
      var m1 = left[0] * right[3] + left[3] * right[4] + left[6] * right[5];
      var m2 = left[0] * right[6] + left[3] * right[7] + left[6] * right[8];
      var m3 = left[1] * right[0] + left[4] * right[1] + left[7] * right[2];
      var m4 = left[1] * right[3] + left[4] * right[4] + left[7] * right[5];
      var m5 = left[1] * right[6] + left[4] * right[7] + left[7] * right[8];
      var m6 = left[2] * right[0] + left[5] * right[1] + left[8] * right[2];
      var m7 = left[2] * right[3] + left[5] * right[4] + left[8] * right[5];
      var m8 = left[2] * right[6] + left[5] * right[7] + left[8] * right[8];
      result[0] = m0;
      result[1] = m1;
      result[2] = m2;
      result[3] = m3;
      result[4] = m4;
      result[5] = m5;
      result[6] = m6;
      result[7] = m7;
      result[8] = m8;
    },

    // vector3 => vector3
    mult3Vector3: function( matrix, vector, result ) {
      var x = matrix[0] * vector.x + matrix[1] * vector.y + matrix[2] * vector.z;
      var y = matrix[3] * vector.x + matrix[4] * vector.y + matrix[5] * vector.z;
      var z = matrix[6] * vector.x + matrix[7] * vector.y + matrix[8] * vector.z;
      result.x = x;
      result.y = y;
      result.z = z;
    },

    // in-place
    swapNegateColumn: function( matrix, idx0, idx1 ) {
      var tmp0 = matrix[idx0];
      var tmp1 = matrix[idx0 + 3];
      var tmp2 = matrix[idx0 + 6];

      matrix[idx0] = matrix[idx1];
      matrix[idx0 + 3] = matrix[idx1 + 3];
      matrix[idx0 + 6] = matrix[idx1 + 6];

      matrix[idx1] = -tmp0;
      matrix[idx1 + 3] = -tmp1;
      matrix[idx1 + 6] = -tmp2;
    },

    setIdentity3: function( result ) {
      result[0] = result[4] = result[8] = 1; // diagonal
      result[1] = result[2] = result[3] = result[5] = result[6] = result[7] = 0; // non-diagonal
    },

    setGivens3: function( result, cos, sin, idx1, idx2 ) {
      assert && assert( idx1 < idx2 );
      this.setIdentity3( result );
      result[this.index3(idx1,idx1)] = cos;
      result[this.index3(idx2,idx2)] = cos;
      result[this.index3(idx1,idx2)] = sin;
      result[this.index3(idx2,idx1)] = -sin;
    },

    applyJacobi3: function( curS, curQ, idx1, idx2 ) {
      var a11 = curS[this.index3(idx1,idx1)];
      var a12 = curS[this.index3(idx1,idx2)];
      var a22 = curS[this.index3(idx2,idx2)];

      // approximate givens angle
      var lhs = a12 * a12;
      var rhs = a11 - a22;
      rhs = rhs * rhs;
      var useAngle = lhs < rhs;
      var w = 1 / Math.sqrt( lhs + rhs );
      this.setGivens3( scratchGivens, useAngle ? ( w * ( a11 - a22 ) ) : SQRT_HALF, useAngle ? ( w * a12 ) : SQRT_HALF, idx1, idx2 );

      // // exact givens angle
      // var theta = 0.5 * Math.atan( 2 * a12 / ( a11 - a22 ) );
      // if ( Math.abs( theta ) > Math.PI / 4 ) {
      //   theta = theta > 0 ? Math.PI / 4 : -Math.PI / 4;
      // }
      // this.setGivens3( scratchGivens, Math.cos( theta ), Math.sin( theta ), idx1, idx2 );

      // S' = Q * S * transpose( Q )
      this.mult3( scratchGivens, curS, curS );
      this.mult3RightTranspose( curS, scratchGivens, curS );

      // Q' = Q * curQ
      this.mult3( scratchGivens, curQ, curQ );
    },

    // TODO: if necessary, hand-code the application of the givens for each index pair
    jacobiIteration3: function( curS, curQ, n ) {
      // for 3x3, we eliminate non-diagonal entries iteratively
      for ( var i = 0; i < n; i++ ) {
        this.applyJacobi3( curS, curQ, 0, 1 );
        this.applyJacobi3( curS, curQ, 0, 2 );
        this.applyJacobi3( curS, curQ, 1, 2 );
      }
    },

    qrAnnihilate3: function( q, r, row, col ) {
      assert && assert( row > col ); // only in the lower-triangular area

      var epsilon = 0.0000000001; // TODO: see how far we can reduce this?
      var cos, sin;

      var diagonalValue = r[this.index3(col, col)];
      var targetValue = r[this.index3(row, col)];
      var diagonalSquared = diagonalValue * diagonalValue;
      var targetSquared = targetValue * targetValue;

      if ( diagonalSquared + targetSquared < epsilon ) {
        cos = diagonalValue > 0 ? 1 : 0;
        sin = 0;
      } else {
        var rsqr = 1 / Math.sqrt( diagonalSquared + targetSquared );
        cos = rsqr * diagonalValue;
        sin = rsqr * targetValue;
      }

      this.setGivens3( scratchGivens, cos, sin, col, row );

      this.mult3( scratchGivens, r, r );
      this.mult3RightTranspose( q, scratchGivens, q );
    },

    svd3: function( a, jacobiIterationCount, resultU, resultSigma, resultV ) {
      var q = resultU;
      var v = resultV;
      var r = resultSigma;


      // for now, use 'r' as our S == transpose( A ) * A
      this.mult3LeftTranspose( a, a, r );
      // we'll accumulate into 'q' == transpose( V ) during the Jacobi iteration
      this.setIdentity3( q );

      this.jacobiIteration3( r, q, jacobiIterationCount );
      this.transpose3( q, v ); // done with this 'q' until we reuse the scratch matrix later below for the QR decomposition

      this.mult3( a, v, r ); // R = AV

      // sort based on singular values
      var mag0 = r[0] * r[0] + r[3] * r[3] + r[6] * r[6]; // column vector magnitudes
      var mag1 = r[1] * r[1] + r[4] * r[4] + r[7] * r[7];
      var mag2 = r[2] * r[2] + r[5] * r[5] + r[8] * r[8];
      var tmpMag;
      if ( mag0 < mag1 ) {
        // swap magnitudes
        tmpMag = mag0;
        mag0 = mag1;
        mag1 = tmpMag;
        this.swapNegateColumn( r, 0, 1 );
        this.swapNegateColumn( v, 0, 1 );
      }
      if ( mag0 < mag2 ) {
        // swap magnitudes
        tmpMag = mag0;
        mag0 = mag2;
        mag2 = tmpMag;
        this.swapNegateColumn( r, 0, 2 );
        this.swapNegateColumn( v, 0, 2 );
      }
      if ( mag1 < mag2 ) {
        this.swapNegateColumn( r, 1, 2 );
        this.swapNegateColumn( v, 1, 2 );
      }

      // QR decomposition
      this.setIdentity3( q ); // reusing Q now for the QR
      this.qrAnnihilate3( q, r, 1, 0 );
      this.qrAnnihilate3( q, r, 2, 0 );
      this.qrAnnihilate3( q, r, 2, 1 );

      var bigEpsilon = 0.001; // they really should be around 1
      if ( q[0] * q[0] + q[1] * q[1] + q[2] * q[2] < bigEpsilon ) {
        q[0] = 1;
      }
      if ( q[3] * q[3] + q[4] * q[4] + q[5] * q[5] < bigEpsilon ) {
        q[4] = 1;
      }
      if ( q[6] * q[6] + q[7] * q[7] + q[8] * q[8] < bigEpsilon ) {
        q[8] = 1;
      }
    },

    /*---------------------------------------------------------------------------*
    * 3xN matrix math
    *----------------------------------------------------------------------------*/

    setVectors3: function( columnVectors, result ) {
      var m = 3;
      var n = columnVectors.length;

      assert && assert( result.length >= m * n, 'Array length check' );

      for ( var i = 0; i < n; i++ ) {
        var vector = columnVectors[i];
        result[i] = vector.x;
        result[i + n] = vector.x;
        result[i + 2 * n] = vector.x;
      }
    },

    getColumnVector3: function( m, n, matrix, columnIndex, result ) {
      assert && assert( m === 3 && columnIndex < n );

      result.x = matrix[columnIndex];
      result.y = matrix[columnIndex + n];
      result.z = matrix[columnIndex + 2 * n];
    },

    /*---------------------------------------------------------------------------*
    * Arbitrary dimension matrix math
    *----------------------------------------------------------------------------*/

    index: function( m, n, row, col ) {
      return n * row + col;
    },

    transpose: function( m, n, matrix, result ) {
      assert && assert( matrix.length >= m * n );
      assert && assert( result.length >= n * m );
      assert && assert( matrix !== result, 'In-place modification not implemented yet' );

      for ( var row = 0; row < m; row++ ) {
        for ( var col = 0; col < n; col++ ) {
          result[m * col + row] = matrix[n * row + col];
        }
      }
    },

    // left is mxn, right is nxp, result is mxp
    mult: function( m, n, p, left, right, result ) {
      assert && assert( left.length >= m * n );
      assert && assert( right.length >= n * p );
      assert && assert( result.length >= m * p );
      assert && assert( left !== result && right !== result, 'In-place modification not implemented yet' );

      for ( var row = 0; row < m; row++ ) {
        for ( var col = 0; col < p; col++ ) {
          var x = 0;
          for ( var k = 0; k < n; k++ ) {
            x += left[this.index( m, n, row, k )] * right[this.index( n, p, k, col )];
          }
          result[this.index( m, p, row, col )] = x;
        }
      }
    },

    // left is mxn, right is pxn, result is mxp
    multRightTranspose: function( m, n, p, left, right, result ) {
      assert && assert( left.length >= m * n );
      assert && assert( right.length >= n * p );
      assert && assert( result.length >= m * p );
      assert && assert( left !== result && right !== result, 'In-place modification not implemented yet' );

      for ( var row = 0; row < m; row++ ) {
        for ( var col = 0; col < p; col++ ) {
          var x = 0;
          for ( var k = 0; k < n; k++ ) {
            x += left[this.index( m, n, row, k )] * right[this.index( p, n, col, k )];
          }
          result[this.index( m, p, row, col )] = x;
        }
      }
    }
  };
} );
