// Copyright 2013-2022, University of Colorado Boulder

/**
 * The ideal local shape for a certain central atom and its (local) neighbors.
 *
 * Also contains the ability to push the local atoms into place, along with many helper functions
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Permutation from '../../../../dot/js/Permutation.js';
import partition from '../../../../phet-core/js/partition.js';
import moleculeShapes from '../../moleculeShapes.js';
import AttractorModel from './AttractorModel.js';

class LocalShape {
  /*
   * @param {Array.<Permutation>} allowedPermutations
   * @param {PairGroup} centralAtom
   * @param {Array.<PairGroup>} groups
   * @param {Array.<Vector3>} idealOrientations
   */
  constructor( allowedPermutations, centralAtom, groups, idealOrientations ) {
    // @public {Array.<Permutation>} - Denotes how we can map the groups into the orientation vectors.
    // Some combinations may not be possible.
    this.allowedPermutations = allowedPermutations;

    // @public {PairGroup} - All of our pair groups should be connected to this atom.
    this.centralAtom = centralAtom;

    // @public {Array.<PairGroup>}
    this.groups = groups;

    // @public {Array.<Vector3>} - The ideal orientations (unit vectors) for the groups representing the
    // ideal local shape.
    this.idealOrientations = idealOrientations;
  }

  /**
   * Attracts the atoms to their ideal shape, and returns the current approximate "error" that they have at this state.
   * @public
   *
   * Attraction done by adding in velocity.
   *
   * @param {number} dt - Amount of time elapsed.
   * @returns {number} Amount of error (least squares-style)
   */
  applyAttraction( dt ) {
    return AttractorModel.applyAttractorForces( this.groups, dt, this.idealOrientations, this.allowedPermutations, this.centralAtom.positionProperty.value, false ).error;
  }

  /**
   * Forces pair-groups with similar angles away from each other.
   * @public
   *
   * @param {number} dt - Amount of time elapsed
   * @param {Permutation} [lastPermutation]
   * @returns {ResultMapping}
   */
  applyAngleAttractionRepulsion( dt, lastPermutation ) {
    return AttractorModel.applyAttractorForces( this.groups, dt, this.idealOrientations, this.allowedPermutations, this.centralAtom.positionProperty.value, true, lastPermutation ).mapping;
  }

  /**
   * Given a list of permutations, return all permutations that exist with the specified indices permuted in all different ways.
   * @private
   *
   * IE, if given the list of the single permutation (12), and specified indices {3,4,5}, the permutations returned will be
   * (12)(34),(12)(35),(12)(45),(12)(453),(12)(534),(12)
   */
  static permuteListWithIndices( permutations, indices ) {
    if ( indices.length < 2 ) {
      // no changes if we can't move more than 1 element (need somewhere to put it)
      return permutations;
    }
    const result = [];
    for ( let i = 0; i < permutations.length; i++ ) {
      const permutation = permutations[ i ];

      const resultsToAdd = permutation.withIndicesPermuted( indices );
      for ( let j = 0; j < resultsToAdd.length; j++ ) {
        result.push( resultsToAdd[ j ] );
      }
    }
    return result;
  }

  /**
   * Allow switching of lone pairs with each other, and all other types of bonds with each other.
   * @public
   *
   * NOTE: I recommended double or triple bonds being put in "higher repulsion" spots over single bonds,
   * but this was specifically rejected. -JO.
   *
   * @param {Array.<PairGroup>} neighbors
   * @param {Array.<Permutation>} permutations
   */
  static vseprPermutations( neighbors ) {
    let permutations = [];
    permutations.push( Permutation.identity( neighbors.length ) );

    const indexOf = group => neighbors.indexOf( group );

    // partition the neighbors into lone pairs and atoms.
    const partitioned = partition( neighbors, group => group.isLonePair );
    // this separation looks better in languages where you say "(lonePairs, atoms) = partition(...)"
    const lonePairs = partitioned[ 0 ];
    const atoms = partitioned[ 1 ];

    // permute away the lone pairs
    permutations = LocalShape.permuteListWithIndices( permutations, _.map( lonePairs, indexOf ) );

    // permute away the bonded groups
    permutations = LocalShape.permuteListWithIndices( permutations, _.map( atoms, indexOf ) );
    return permutations;
  }

  /**
   * Allow switching of lone pairs with each other, and all other types of bonds with the same type of element.
   * @public
   *
   * @param {Array.<PairGroup>} neighbors
   * @param {Array.<Permutation>} permutations
   */
  static realPermutations( neighbors ) {
    let permutations = [];
    permutations.push( Permutation.identity( neighbors.length ) );

    const indexOf = group => neighbors.indexOf( group );

    // allow interchanging of lone pairs
    const lonePairs = _.filter( neighbors, group => group.isLonePair );
    permutations = LocalShape.permuteListWithIndices( permutations, _.map( lonePairs, indexOf ) );

    // allow interchanging of pair groups when they have the same chemical element
    const atoms = _.filter( neighbors, group => !group.isLonePair );

    const usedElements = _.uniq( _.map( atoms, group => group.element ) );

    for ( let i = 0; i < usedElements.length; i++ ) {
      const element = usedElements[ i ];

      // since the closure is being executed at this point, the warning in this line can be ignored
      const atomsWithElement = _.filter( atoms, group => group.element === element );
      permutations = LocalShape.permuteListWithIndices( permutations, _.map( atomsWithElement, indexOf ) );
    }

    return permutations;
  }
}

moleculeShapes.register( 'LocalShape', LocalShape );

export default LocalShape;