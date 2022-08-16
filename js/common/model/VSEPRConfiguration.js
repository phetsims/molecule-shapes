// Copyright 2013-2022, University of Colorado Boulder

/**
 * A simple molecule configuration that doesn't discriminate between bond or atom types (only lone pairs vs bonds).
 *
 * Note that we use X and E for the radial atom and radial lone pair count (respectively) due to its usage in chemistry,
 * with the "AXE method" (see http://en.wikipedia.org/wiki/VSEPR_theory)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Permutation from '../../../../dot/js/Permutation.js';
import moleculeShapes from '../../moleculeShapes.js';
import AttractorModel from './AttractorModel.js';
import ElectronGeometry from './ElectronGeometry.js';
import LocalShape from './LocalShape.js';
import MoleculeGeometry from './MoleculeGeometry.js';

// for looking up VSEPRConfiguration instances
const configurationMap = {}; // x+','+e => {VSEPRConfiguration}

class VSEPRConfiguration {
  /*
   * @param {number} x - Number of radial atoms connected to the central atom
   * @param {number} e - Number of radial lone pairs connected to the central atom
   */
  constructor( x, e ) {
    this.x = x; // @public {number} - Number of radial atoms connected to the central atom
    this.e = e; // @public {number} - Number of radial lone pairs connected to the central atom

    // @public {MoleculeGeometry}
    this.moleculeGeometry = MoleculeGeometry.getConfiguration( x, e );

    // @public {ElectronGeometry}
    this.electronGeometry = ElectronGeometry.getConfiguration( x + e );

    this.bondOrientations = []; // @public {Array.<Vector3>}
    this.lonePairOrientations = []; // @public {Array.<Vector3>}
    this.allOrientations = this.electronGeometry.unitVectors; // @public {Array.<Vector3>}

    for ( let i = 0; i < x + e; i++ ) {
      if ( i < e ) {
        // fill up the lone pair unit vectors first
        this.lonePairOrientations.push( this.electronGeometry.unitVectors[ i ] );
      }
      else {
        this.bondOrientations.push( this.electronGeometry.unitVectors[ i ] );
      }
    }
  }

  /**
   * For finding ideal rotations including matching for 'bond-vs-bond' and 'lone pair-vs-lone pair'.
   * @public
   *
   * @param {Array.<PairGroup>} groups
   * @returns {AttractorModel.ResultMapping}
   */
  getIdealGroupRotationToPositions( groups ) {
    assert && assert( ( this.x + this.e ) === groups.length );

    // done currently only when the molecule is rebuilt, so we don't try to pass a lastPermutation in (not helpful)
    return AttractorModel.findClosestMatchingConfiguration( AttractorModel.getOrientationsFromOrigin( groups ),
      this.electronGeometry.unitVectors,
      LocalShape.vseprPermutations( groups ) );
  }

  /**
   * For finding ideal rotations exclusively using the 'bonded' portions.
   * @public
   *
   * @param {Array.<PairGroup>} groups
   * @returns {AttractorModel.ResultMapping}
   */
  getIdealBondRotationToPositions( groups ) {
    // ideal vectors excluding lone pairs (just for the bonds)
    assert && assert( ( this.x ) === groups.length );

    // currently only called when a real molecule is built, so we don't try to pass a lastPermutation in (not helpful)
    return AttractorModel.findClosestMatchingConfiguration( AttractorModel.getOrientationsFromOrigin( groups ),
      this.bondOrientations,
      Permutation.permutations( this.bondOrientations.length ) );
  }

  /*
   * Returns cached VSEPRConfigurations based on radial atom/lone-pair counts.
   * @public
   *
   * @param {number} x - Number of radial atoms connected to the central atom
   * @param {number} e - Number of radial lone pairs connected to the central atom
   * @returns {VSEPRConfiguration} - Cached configuration
   */
  static getConfiguration( x, e ) {
    const key = `${x},${e}`;
    if ( key in configurationMap ) {
      return configurationMap[ key ];
    }
    else {
      const configuration = new VSEPRConfiguration( x, e );
      configurationMap[ key ] = configuration;
      return configuration;
    }
  }
}

moleculeShapes.register( 'VSEPRConfiguration', VSEPRConfiguration );
export default VSEPRConfiguration;