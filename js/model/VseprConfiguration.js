// Copyright 2002-2014, University of Colorado Boulder

/**
 * A molecule that behaves with a behavior that doesn't discriminate between bond or atom types (only lone pairs vs bonds)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Permutation = require( 'DOT/Permutation' );
  var AttractorModel = require( 'MOLECULE_SHAPES/model/AttractorModel' );
  var GeometryConfiguration = require( 'MOLECULE_SHAPES/model/GeometryConfiguration' );
  var LocalShape = require( 'MOLECULE_SHAPES/model/LocalShape' );

  // strings
  var shapeEmptyString = require( 'string!MOLECULE_SHAPES/shape.empty' );
  var shapeDiatomicString = require( 'string!MOLECULE_SHAPES/shape.diatomic' );
  var shapeLinearString = require( 'string!MOLECULE_SHAPES/shape.linear' );
  var shapeBentString = require( 'string!MOLECULE_SHAPES/shape.bent' );
  var shapeTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/shape.trigonalPlanar' );
  var shapeTrigonalPyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalPyramidal' );
  var shapeTShapedString = require( 'string!MOLECULE_SHAPES/shape.tShaped' );
  var shapeTetrahedralString = require( 'string!MOLECULE_SHAPES/shape.tetrahedral' );
  var shapeSeesawString = require( 'string!MOLECULE_SHAPES/shape.seesaw' );
  var shapeSquarePlanarString = require( 'string!MOLECULE_SHAPES/shape.squarePlanar' );
  var shapeTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalBipyramidal' );
  var shapeSquarePyramidalString = require( 'string!MOLECULE_SHAPES/shape.squarePyramidal' );
  var shapeOctahedralString = require( 'string!MOLECULE_SHAPES/shape.octahedral' );

  function VseprConfiguration( x, e ) {
    this.x = x;
    this.e = e;

    this.geometry = GeometryConfiguration.getConfiguration( x + e ); // undefined?
    this.bondedUnitVectors = [];
    this.lonePairUnitVectors = [];
    for ( var i = 0; i < x + e; i++ ) {
      if ( i < e ) {
        // fill up the lone pair unit vectors first
        this.lonePairUnitVectors.push( this.geometry.unitVectors[i] );
      }
      else {
        this.bondedUnitVectors.push( this.geometry.unitVectors[i] );
      }
    }

    // figure out what the name is
    if ( x === 0 ) {
      this.name = shapeEmptyString;
    }
    else if ( x === 1 ) {
      this.name = shapeDiatomicString;
    }
    else if ( x === 2 ) {
      if ( e === 0 || e === 3 || e === 4 ) {
        this.name = shapeLinearString;
      }
      else if ( e === 1 || e === 2 ) {
        this.name = shapeBentString;
      }
      else {
        throw new Error( 'invalid x: ' + x + ', e: ' + e );
      }
    }
    else if ( x === 3 ) {
      if ( e === 0 ) {
        this.name = shapeTrigonalPlanarString;
      }
      else if ( e === 1 ) {
        this.name = shapeTrigonalPyramidalString;
      }
      else if ( e === 2 || e === 3 ) {
        this.name = shapeTShapedString;
      }
      else {
        throw new Error( 'invalid x: ' + x + ', e: ' + e );
      }
    }
    else if ( x === 4 ) {
      if ( e === 0 ) {
        this.name = shapeTetrahedralString;
      }
      else if ( e === 1 ) {
        this.name = shapeSeesawString;
      }
      else if ( e === 2 ) {
        this.name = shapeSquarePlanarString;
      }
      else {
        throw new Error( 'invalid x: ' + x + ', e: ' + e );
      }
    }
    else if ( x === 5 ) {
      if ( e === 0 ) {
        this.name = shapeTrigonalBipyramidalString;
      }
      else if ( e === 1 ) {
        this.name = shapeSquarePyramidalString;
      }
      else {
        throw new Error( 'invalid x: ' + x + ', e: ' + e );
      }
    }
    else if ( x === 6 ) {
      if ( e === 0 ) {
        this.name = shapeOctahedralString;
      }
      else {
        throw new Error( 'invalid x: ' + x + ', e: ' + e );
      }
    }
    else {
      this.name = null;
    }
  }

  return inherit( Object, VseprConfiguration, {
    getAllUnitVectors: function() {
      return this.geometry.unitVectors;
    },

    getIdealBondUnitVectors: function() {
      var result = [];
      for ( var i = this.e; i < this.x + this.e; i++ ) {
        result.push( this.geometry.unitVectors[i] );
      }
      return result;
    },

    // for finding ideal rotations including matching for 'bond-vs-bond' and 'lone pair-vs-lone pair'
    getIdealGroupRotationToPositions: function( groups ) {
      assert && assert( ( this.x + this.e ) === groups.length );

      // done currently only when the molecule is rebuilt, so we don't try to pass a lastPermutation in (not helpful)
      return AttractorModel.findClosestMatchingConfiguration( AttractorModel.getOrientationsFromOrigin( groups ), this.geometry.unitVectors, LocalShape.vseprPermutations( groups ) );
    },

    // for finding ideal rotations exclusively using the 'bonded' portions
    getIdealBondRotationToPositions: function( groups ) {
      // ideal vectors excluding lone pairs (just for the bonds)
      assert && assert( ( this.x ) === groups.length );
      var idealModelBondVectors = this.getIdealBondUnitVectors();

      // currently only called when a real molecule is built, so we don't try to pass a lastPermutation in (not helpful)
      return AttractorModel.findClosestMatchingConfiguration( AttractorModel.getOrientationsFromOrigin( groups ), idealModelBondVectors, Permutation.permutations( idealModelBondVectors.length ) );
    },

    equals: function( other ) {
      return this.x === other.x && this.e === other.e;
    }
  } );
} );
