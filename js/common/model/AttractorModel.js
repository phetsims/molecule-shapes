// Copyright 2013-2022, University of Colorado Boulder

/**
 * Contains the logic for applying an "attractor" force to a molecule that first:
 * (1) finds the closest VSEPR configuration (with rotation) to our current positions, and
 * (2) pushes the electron pairs towards those positions.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix from '../../../../dot/js/Matrix.js';
import MatrixOps3 from '../../../../dot/js/MatrixOps3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import pairs from '../../../../phet-core/js/pairs.js';
import moleculeShapes from '../../moleculeShapes.js';
import PairGroup from './PairGroup.js';

// just static calls, so just create an empty object
const AttractorModel = {};
moleculeShapes.register( 'AttractorModel', AttractorModel );

/**
 * Apply an attraction to the closest ideal position, with the given time elapsed
 * @public
 *
 * @param {Array.<PairGroup>} groups - An ordered list of pair groups that should be considered, along with the relevant permutations
 * @param {number} timeElapsed - Time elapsed (seconds)
 * @param {Array.<Vector3>} idealOrientations - An ideal position, that may be rotated.
 * @param {Array.<Permutation>} allowablePermutations - The un-rotated stable position that we are attracted towards
 * @param {Vector3} center - The point that the groups should be rotated around. Usually a central atom that all of the groups connect to
 * @returns {mapping: ResultMapping, error: number} A measure of total error (least squares-style)
 */
AttractorModel.applyAttractorForces = ( groups, timeElapsed, idealOrientations, allowablePermutations, center, angleRepulsion, lastPermutation ) => {
  const currentOrientations = _.map( groups, group => group.positionProperty.value.minus( center ).normalized() );
  const mapping = AttractorModel.findClosestMatchingConfiguration( currentOrientations, idealOrientations, allowablePermutations, lastPermutation );

  const aroundCenterAtom = center.equals( Vector3.ZERO );

  let totalDeltaMagnitude = 0;
  let i;

  // for each electron pair, push it towards its computed target
  for ( i = 0; i < groups.length; i++ ) {

    const pair = groups[ i ];

    const targetOrientation = mapping.target.extractVector3( i );
    const currentMagnitude = ( pair.positionProperty.value.minus( center ) ).magnitude;
    const targetPosition = targetOrientation.times( currentMagnitude ).plus( center );

    const delta = targetPosition.minus( pair.positionProperty.value );
    totalDeltaMagnitude += delta.magnitude * delta.magnitude;

    /*
     * NOTE: adding delta here effectively is squaring the distance, thus more force when far from the target,
     * and less force when close to the target. This is important, since we want more force in a potentially
     * otherwise-stable position, and less force where our coulomb-like repulsion will settle it into a stable
     * position
     */
    const strength = timeElapsed * 3 * delta.magnitude;

    // change the velocity of all of the pairs, unless it is an atom at the origin!
    if ( pair.isLonePair || !pair.isCentralAtom ) {
      if ( aroundCenterAtom ) {
        pair.addVelocity( delta.times( strength ) );
      }
    }

    // position movement for faster convergence
    if ( !pair.isCentralAtom && aroundCenterAtom ) { // TODO: better way of not moving the center atom?
      pair.addPosition( delta.times( 2.0 * timeElapsed ) );
    }

    // if we are a terminal lone pair, move us just with this but much more quickly
    if ( !pair.isCentralAtom && !aroundCenterAtom ) {
      pair.addPosition( delta.times( Math.min( 20.0 * timeElapsed, 1 ) ) );
    }
  }

  const error = Math.sqrt( totalDeltaMagnitude );

  // angle-based repulsion
  if ( angleRepulsion && aroundCenterAtom ) {
    const pairIndexList = pairs( Utils.rangeInclusive( 0, groups.length - 1 ) );
    for ( i = 0; i < pairIndexList.length; i++ ) {
      const pairIndices = pairIndexList[ i ];
      const aIndex = pairIndices[ 0 ];
      const bIndex = pairIndices[ 1 ];
      const a = groups[ aIndex ];
      const b = groups[ bIndex ];

      // current orientations w.r.t. the center
      const aOrientation = a.positionProperty.value.minus( center ).normalized();
      const bOrientation = b.positionProperty.value.minus( center ).normalized();

      // desired orientations
      const aTarget = mapping.target.extractVector3( aIndex ).normalized();
      const bTarget = mapping.target.extractVector3( bIndex ).normalized();
      const targetAngle = Math.acos( Utils.clamp( aTarget.dot( bTarget ), -1, 1 ) );
      const currentAngle = Math.acos( Utils.clamp( aOrientation.dot( bOrientation ), -1, 1 ) );
      const angleDifference = ( targetAngle - currentAngle );

      const dirTowardsA = a.positionProperty.value.minus( b.positionProperty.value ).normalized();
      const timeFactor = PairGroup.getTimescaleImpulseFactor( timeElapsed );

      // Dampen our push if we switched permutations, see https://github.com/phetsims/molecule-shapes/issues/203
      const oscillationPreventionFactor = ( lastPermutation && !lastPermutation.equals( mapping.permutation ) ) ? 0.5 : 1;

      const extraClosePushFactor = Utils.clamp( 3 * Math.pow( Math.PI - currentAngle, 2 ) / ( Math.PI * Math.PI ), 1, 3 );

      const push = dirTowardsA.times( oscillationPreventionFactor *
                                      timeFactor *
                                      angleDifference *
                                      PairGroup.ANGLE_REPULSION_SCALE *
                                      ( currentAngle < targetAngle ? 2.0 : 0.5 ) *
                                      extraClosePushFactor );
      a.addVelocity( push );
      b.addVelocity( push.negated() );
    }
  }

  return { mapping: mapping, error: error };
};

// maximum size of most computations is 3x6
const scratchXArray = new MatrixOps3.Array( 18 );
const scratchYArray = new MatrixOps3.Array( 18 );
const scratchIdealsArray = new MatrixOps3.Array( 18 );

/**
 * Find the closest VSEPR configuration for a particular molecule. Conceptually, we iterate through
 * each possible valid 1-to-1 mapping from electron pair to direction in our VSEPR geometry. For each
 * mapping, we calculate the rotation that makes the best match, and then calculate the error. We return
 * a result for the mapping (permutation) with the lowest error.
 * @public
 *
 * This uses a slightly modified rotation computation from http://igl.ethz.ch/projects/ARAP/svd_rot.pdf
 * (Least-Squares Rigid Motion Using SVD). Basically, we ignore the centroid and translation computations,
 * since we want everything to be rotated around the origin. We also don't weight the individual electron
 * pairs.
 *
 * Of note, the lower-index slots in the VSEPRConfiguration (Geometry) are for higher-repulsion
 * pair groups (the order is triple > double > lone pair > single). We need to iterate through all permutations,
 * but with the repulsion-ordering constraint (no single bond will be assigned a lower-index slot than a lone pair)
 * so we end up splitting the potential slots into bins for each repulsion type and iterating over all of the permutations.
 *
 * @param {Array.<Vector3>} currentOrientations - An ordered list of orientations (normalized) that should be considered, along with the relevant permutations
 * @param {Array.<Vector3>} idealOrientations - The un-rotated stable position that we are attracted towards
 * @param {Array.<Permutation>} allowablePermutations - A list of permutations that map stable positions to pair groups in order.
 * @param {Permutation} [lastPermutation]
 * @returns {ResultMapping} (see docs there)
 */
AttractorModel.findClosestMatchingConfiguration = ( currentOrientations, idealOrientations, allowablePermutations, lastPermutation ) => {
  const n = currentOrientations.length; // number of total pairs

  // y == electron pair positions
  const y = scratchYArray;
  MatrixOps3.setVectors3( currentOrientations, y );

  const x = scratchXArray;

  const ideals = scratchIdealsArray;
  MatrixOps3.setVectors3( idealOrientations, ideals );


  // closure over constant variables
  function calculateTarget( permutation ) {
    // x == configuration positions
    MatrixOps3.permuteColumns( 3, n, ideals, permutation, x );

    // compute the rotation matrix
    const rot = new Matrix( 3, 3 );
    AttractorModel.computeRotationMatrixWithTranspose( n, x, y, rot.entries );

    // target matrix, same shape as our y (current position) matrix
    const target = new Matrix( 3, n );
    MatrixOps3.mult( 3, 3, n, rot.entries, x, target.entries ); // target = rot * x

    // calculate the error
    let error = 0;
    for ( let i = 0; i < n * 3; i++ ) {
      const diff = y[ i ] - target.entries[ i ];
      error += diff * diff;
    }

    return new AttractorModel.ResultMapping( error, target, permutation, rot );
  }

  let bestResult = lastPermutation !== undefined ? calculateTarget( lastPermutation ) : null;

  // TODO: log how effective the permutation checking is at removing the search space
  for ( let pIndex = 0; pIndex < allowablePermutations.length; pIndex++ ) {
    const permutation = allowablePermutations[ pIndex ];

    if ( n > 2 && bestResult !== null && bestResult.permutation !== permutation ) {
      const permutedOrientation0 = idealOrientations[ permutation.indices[ 0 ] ];
      const permutedOrientation1 = idealOrientations[ permutation.indices[ 1 ] ];
      const errorLowBound = 4 - 4 * Math.cos( Math.abs(
                            Math.acos( Utils.clamp( permutedOrientation0.dot( currentOrientations[ 0 ] ), -1, 1 ) ) -
                            Math.acos( Utils.clamp( permutedOrientation1.dot( currentOrientations[ 1 ] ), -1, 1 ) )
      ) );

      // throw out results where this arbitrarily-chosen lower bound rules out the entire permutation
      if ( bestResult.error < errorLowBound ) {
        continue;
      }
    }

    const result = calculateTarget( permutation );

    if ( bestResult === null || result.error < bestResult.error ) {
      bestResult = result;
    }
  }
  return bestResult;
};

/**
 * Convenience for extracting orientations from an array of PairGroups
 * @public
 *
 * @param {Array.<PairGroup>} groups
 */
AttractorModel.getOrientationsFromOrigin = groups => _.map( groups, group => group.orientation );

// scratch matrices for the SVD calculations
const scratchMatrix = new MatrixOps3.Array( 9 );
const scratchU = new MatrixOps3.Array( 9 );
const scratchSigma = new MatrixOps3.Array( 9 );
const scratchV = new MatrixOps3.Array( 9 );

/**
 * In 3D, Given n points x_i and n points y_i, determine the rotation matrix that can be applied to the x_i such
 * that it minimizes the least-squares error between each x_i and y_i.
 * @private
 *
 * @param {number} n - Quantity of points
 * @param {MatrixOps3.Array} x - A 3xN MatrixOps3 matrix where each column represents a point x_i
 * @param {MatrixOps3.Array} y - A 3xN MatrixOps3 matrix where each column represents a point y_i
 * @param {MatrixOps3.Array} result - A 3x3 MatrixOps3 matrix where the rotation matrix result will be stored (there is no return value).
 */
AttractorModel.computeRotationMatrixWithTranspose = ( n, x, y, result ) => {
  // S = X * Y^T, in our case always 3x3
  const s = scratchMatrix;
  MatrixOps3.multRightTranspose( 3, n, 3, x, y, s );

  // this code may loop infinitely on NaN, so we want to double-check
  assert && assert( !isNaN( s[ 0 ] ) );

  // Sets U, Sigma, V
  MatrixOps3.svd3( s, 5, scratchU, scratchSigma, scratchV );

  // If last fastSigma entry is negative, a reflection would have been a better match. Consider [1,0,0 0,1,0 0,0,-1]
  // multiplied in-between to reverse if that will help in the future.
  // result = V * U^T
  MatrixOps3.mult3RightTranspose( scratchV, scratchU, result );
};

AttractorModel.ResultMapping = class ResultMapping {
  /**
   * Result mapping between the current positions and ideal positions. Returned as a data object.
   * @public
   *
   * @param {number} error - Total error of this mapping
   * @param {Matrix} target - The positions of ideal pair groups
   * @param {Permutation} permutation - The permutation between current pair groups and ideal pair groups
   * @param {Matrix} rotation - The rotation between the current and ideal
   */
  constructor( error, target, permutation, rotation ) {
    this.error = error;
    this.target = target;
    this.permutation = permutation;
    this.rotation = rotation;
  }

  /**
   * Returns a copy of the input vector, rotated from the "current" frame of reference to the "ideal" frame of
   * reference.
   * @public
   *
   * @param {Vector3} v
   */
  rotateVector( v ) {
    const x = Matrix.columnVector3( v );
    const rotated = this.rotation.times( x );
    return rotated.extractVector3( 0 );
  }
};

/**
 * Call the function with each individual permutation of the list elements of "lists"
 * @private
 *
 * @param lists  List of lists. Order of lists will not change, however each possible permutation involving sub-lists will be used
 * @param callback Function to call
 */
AttractorModel.forEachMultiplePermutations = ( lists, callback ) => {
  if ( lists.length === 0 ) {
    callback( lists );
  }
  else {
    // make a copy of 'lists'
    const remainder = lists.slice( 0 );
    const first = remainder[ 0 ];

    remainder.splice( 0, 1 );

    AttractorModel.forEachPermutation( first, [], permutedFirst => {
      AttractorModel.forEachMultiplePermutations( remainder, subLists => {
        const arr = new Array( lists.length );
        arr[ 0 ] = permutedFirst;
        for ( let i = 0; i < subLists.length; i++ ) {
          arr[ i + 1 ] = subLists[ i ];
        }
        callback( arr );
      } );
    } );
  }
};

/**
 * Call our function with each permutation of the provided list PREFIXED by prefix, in lexicographic order
 * @private
 *
 * @param list   List to generate permutations of
 * @param prefix   Elements that should be inserted at the front of each list before each call
 * @param callback Function to call
 */
AttractorModel.forEachPermutation = ( list, prefix, callback ) => {
  if ( list.length === 0 ) {
    callback( prefix );
  }
  else {
    for ( let i = 0; i < list.length; i++ ) {
      const element = list[ i ];

      const newList = list.slice();
      newList.splice( newList.indexOf( element ), 1 );

      const newPrefix = prefix.slice();
      newPrefix.push( element );

      AttractorModel.forEachPermutation( newList, newPrefix, callback );
    }
  }
};

/**
 * Debugging aid for converting an array of arrays to a string.
 * @private
 *
 * @param {Array.<Array.<*>>} lists
 */
AttractorModel.listPrint = lists => {
  let ret = '';
  for ( let i = 0; i < lists.length; i++ ) {
    const list = lists[ i ];
    ret += ' ';
    for ( let j = 0; j < list.length; j++ ) {
      ret += list[ j ].toString();
    }
  }
  return ret;
};

/**
 * Testing function for permutations
 * @private
 */
AttractorModel.testMe = () => {
  /*
   Testing of permuting each individual list. Output:
   AB C DEF
   AB C DFE
   AB C EDF
   AB C EFD
   AB C FDE
   AB C FED
   BA C DEF
   BA C DFE
   BA C EDF
   BA C EFD
   BA C FDE
   BA C FED
   */

  const arr = [
    [ 'A', 'B' ],
    [ 'C' ],
    [ 'D', 'E', 'F' ]
  ];

  AttractorModel.forEachMultiplePermutations( arr, lists => {
    console.log( AttractorModel.listPrint( lists ) );
  } );
};

export default AttractorModel;
