// Copyright 2013-2017, University of Colorado Boulder

/**
 * A simple molecule configuration that doesn't discriminate between bond or atom types (only lone pairs vs bonds).
 *
 * Note that we use X and E for the radial atom and radial lone pair count (respectively) due to its usage in chemistry,
 * with the "AXE method" (see http://en.wikipedia.org/wiki/VSEPR_theory)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AttractorModel = require( 'MOLECULE_SHAPES/common/model/AttractorModel' );
  const GeometryConfiguration = require( 'MOLECULE_SHAPES/common/model/GeometryConfiguration' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const Permutation = require( 'DOT/Permutation' );

  // strings
  const shapeBentString = require( 'string!MOLECULE_SHAPES/shape.bent' );
  const shapeDiatomicString = require( 'string!MOLECULE_SHAPES/shape.diatomic' );
  const shapeEmptyString = require( 'string!MOLECULE_SHAPES/shape.empty' );
  const shapeLinearString = require( 'string!MOLECULE_SHAPES/shape.linear' );
  const shapeOctahedralString = require( 'string!MOLECULE_SHAPES/shape.octahedral' );
  const shapeSeesawString = require( 'string!MOLECULE_SHAPES/shape.seesaw' );
  const shapeSquarePlanarString = require( 'string!MOLECULE_SHAPES/shape.squarePlanar' );
  const shapeSquarePyramidalString = require( 'string!MOLECULE_SHAPES/shape.squarePyramidal' );
  const shapeTetrahedralString = require( 'string!MOLECULE_SHAPES/shape.tetrahedral' );
  const shapeTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalBipyramidal' );
  const shapeTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/shape.trigonalPlanar' );
  const shapeTrigonalPyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalPyramidal' );
  const shapeTShapedString = require( 'string!MOLECULE_SHAPES/shape.tShaped' );

  // for looking up VSEPRConfiguration instances
  var configurationMap = {}; // x+','+e => {VSEPRConfiguration}

  /*
   * @constructor
   * @param {number} x - Number of radial atoms connected to the central atom
   * @param {number} e - Number of radial lone pairs connected to the central atom
   */
  function VSEPRConfiguration( x, e ) {
    this.x = x; // @public {number} - Number of radial atoms connected to the central atom
    this.e = e; // @public {number} - Number of radial lone pairs connected to the central atom
    this.name = VSEPRConfiguration.getName( x, e ); // @public {string}

    this.geometry = GeometryConfiguration.getConfiguration( x + e ); // @public {GeometryConfiguration}
    this.bondOrientations = []; // @public {Array.<Vector3>}
    this.lonePairOrientations = []; // @public {Array.<Vector3>}
    this.allOrientations = this.geometry.unitVectors; // @public {Array.<Vector3>}

    for ( var i = 0; i < x + e; i++ ) {
      if ( i < e ) {
        // fill up the lone pair unit vectors first
        this.lonePairOrientations.push( this.geometry.unitVectors[ i ] );
      }
      else {
        this.bondOrientations.push( this.geometry.unitVectors[ i ] );
      }
    }
  }

  moleculeShapes.register( 'VSEPRConfiguration', VSEPRConfiguration );

  return inherit( Object, VSEPRConfiguration, {
    /**
     * For finding ideal rotations including matching for 'bond-vs-bond' and 'lone pair-vs-lone pair'.
     * @public
     *
     * @param {Array.<PairGroup>} groups
     * @returns {AttractorModel.ResultMapping}
     */
    getIdealGroupRotationToPositions: function( groups ) {
      assert && assert( ( this.x + this.e ) === groups.length );

      // done currently only when the molecule is rebuilt, so we don't try to pass a lastPermutation in (not helpful)
      return AttractorModel.findClosestMatchingConfiguration( AttractorModel.getOrientationsFromOrigin( groups ),
        this.geometry.unitVectors,
        LocalShape.vseprPermutations( groups ) );
    },

    /**
     * For finding ideal rotations exclusively using the 'bonded' portions.
     * @public
     *
     * @param {Array.<PairGroup>} groups
     * @returns {AttractorModel.ResultMapping}
     */
    getIdealBondRotationToPositions: function( groups ) {
      // ideal vectors excluding lone pairs (just for the bonds)
      assert && assert( ( this.x ) === groups.length );

      // currently only called when a real molecule is built, so we don't try to pass a lastPermutation in (not helpful)
      return AttractorModel.findClosestMatchingConfiguration( AttractorModel.getOrientationsFromOrigin( groups ),
        this.bondOrientations,
        Permutation.permutations( this.bondOrientations.length ) );
    }
  }, {
    /**
     * Returns the "geometry" name.
     * @public
     *
     * @param {number} x - Number of radial atoms connected to the central atom
     * @param {number} e - Number of radial lone pairs connected to the central atom
     * @returns {string}
     */
    getName: function( x, e ) {
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
          throw new Error( 'invalid x: ' + x + ', e: ' + e );
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
          throw new Error( 'invalid x: ' + x + ', e: ' + e );
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
          throw new Error( 'invalid x: ' + x + ', e: ' + e );
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
          throw new Error( 'invalid x: ' + x + ', e: ' + e );
        }
      }
      else if ( x === 6 ) {
        if ( e === 0 ) {
          return shapeOctahedralString;
        }
        else {
          throw new Error( 'invalid x: ' + x + ', e: ' + e );
        }
      }
      else {
        throw new Error( 'unknown VSEPR configuration x: ' + x + ', e: ' + e );
      }
    },

    /*
     * Returns cached VSEPRConfigurations based on radial atom/lone-pair counts.
     * @public
     *
     * @param {number} x - Number of radial atoms connected to the central atom
     * @param {number} e - Number of radial lone pairs connected to the central atom
     * @returns {VSEPRConfiguration} - Cached configuration
     */
    getConfiguration: function( x, e ) {
      var key = x + ',' + e;
      if ( key in configurationMap ) {
        return configurationMap[ key ];
      }
      else {
        var configuration = new VSEPRConfiguration( x, e );
        configurationMap[ key ] = configuration;
        return configuration;
      }
    }
  } );
} );
