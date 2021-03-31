// Copyright 2013-2020, University of Colorado Boulder

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
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import AttractorModel from './AttractorModel.js';
import Geometry from './Geometry.js';
import LocalShape from './LocalShape.js';

const shapeBentString = moleculeShapesStrings.shape.bent;
const shapeDiatomicString = moleculeShapesStrings.shape.diatomic;
const shapeEmptyString = moleculeShapesStrings.shape.empty;
const shapeLinearString = moleculeShapesStrings.shape.linear;
const shapeOctahedralString = moleculeShapesStrings.shape.octahedral;
const shapeSeesawString = moleculeShapesStrings.shape.seesaw;
const shapeSquarePlanarString = moleculeShapesStrings.shape.squarePlanar;
const shapeSquarePyramidalString = moleculeShapesStrings.shape.squarePyramidal;
const shapeTetrahedralString = moleculeShapesStrings.shape.tetrahedral;
const shapeTrigonalBipyramidalString = moleculeShapesStrings.shape.trigonalBipyramidal;
const shapeTrigonalPlanarString = moleculeShapesStrings.shape.trigonalPlanar;
const shapeTrigonalPyramidalString = moleculeShapesStrings.shape.trigonalPyramidal;
const shapeTShapedString = moleculeShapesStrings.shape.tShaped;

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
    this.name = VSEPRConfiguration.getName( x, e ); // @public {string}

    this.geometry = Geometry.getConfiguration( x + e ); // @public {Geometry}
    this.bondOrientations = []; // @public {Array.<Vector3>}
    this.lonePairOrientations = []; // @public {Array.<Vector3>}
    this.allOrientations = this.geometry.unitVectors; // @public {Array.<Vector3>}

    for ( let i = 0; i < x + e; i++ ) {
      if ( i < e ) {
        // fill up the lone pair unit vectors first
        this.lonePairOrientations.push( this.geometry.unitVectors[ i ] );
      }
      else {
        this.bondOrientations.push( this.geometry.unitVectors[ i ] );
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
      this.geometry.unitVectors,
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

  /**
   * Returns the "geometry" name.
   * @public
   *
   * @param {number} x - Number of radial atoms connected to the central atom
   * @param {number} e - Number of radial lone pairs connected to the central atom
   * @returns {string}
   */
  static getName( x, e ) {
    // figure out what the name is
    if ( x === 0 ) {
      return shapeEmptyString;
    }
    else if ( x === 1 ) {
      return shapeDiatomicString;
    }
    else if ( x === 2 ) {
      if ( e === 0 || e === 3 || e === 4 ) {
        return shapeLinearString;
      }
      else if ( e === 1 || e === 2 ) {
        return shapeBentString;
      }
      else {
        throw new Error( `invalid x: ${x}, e: ${e}` );
      }
    }
    else if ( x === 3 ) {
      if ( e === 0 ) {
        return shapeTrigonalPlanarString;
      }
      else if ( e === 1 ) {
        return shapeTrigonalPyramidalString;
      }
      else if ( e === 2 || e === 3 ) {
        return shapeTShapedString;
      }
      else {
        throw new Error( `invalid x: ${x}, e: ${e}` );
      }
    }
    else if ( x === 4 ) {
      if ( e === 0 ) {
        return shapeTetrahedralString;
      }
      else if ( e === 1 ) {
        return shapeSeesawString;
      }
      else if ( e === 2 ) {
        return shapeSquarePlanarString;
      }
      else {
        throw new Error( `invalid x: ${x}, e: ${e}` );
      }
    }
    else if ( x === 5 ) {
      if ( e === 0 ) {
        return shapeTrigonalBipyramidalString;
      }
      else if ( e === 1 ) {
        return shapeSquarePyramidalString;
      }
      else {
        throw new Error( `invalid x: ${x}, e: ${e}` );
      }
    }
    else if ( x === 6 ) {
      if ( e === 0 ) {
        return shapeOctahedralString;
      }
      else {
        throw new Error( `invalid x: ${x}, e: ${e}` );
      }
    }
    else {
      throw new Error( `unknown VSEPR configuration x: ${x}, e: ${e}` );
    }
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