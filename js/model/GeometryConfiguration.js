// Copyright 2002-2014, University of Colorado Boulder

/**
 * Contains the "optimal" molecule structures (pair group directions stored as unit vectors),
 * in an order such that higher-repulsion pair groups (lone pairs)
 * will tend to occupy the 1st slots, and bonds will occupy the later slots.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var Vector3 = require( 'DOT/Vector3' );

  var geometryEmptyString = require( 'string!MOLECULE_SHAPES/geometry.empty' );
  var geometryDiatomicString = require( 'string!MOLECULE_SHAPES/geometry.diatomic' );
  var geometryLinearString = require( 'string!MOLECULE_SHAPES/geometry.linear' );
  var geometryTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/geometry.trigonalPlanar' );
  var geometryTetrahedralString = require( 'string!MOLECULE_SHAPES/geometry.tetrahedral' );
  var geometryTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/geometry.trigonalBipyramidal' );
  var geometryOctahedralString = require( 'string!MOLECULE_SHAPES/geometry.octahedral' );

  var TETRA_CONST = Math.PI * -19.471220333 / 180;

  function GeometryConfiguration( name, unitVectors ) {
    this.name = name;
    this.unitVectors = unitVectors;
  }

  var geometries = {
    0: new GeometryConfiguration( geometryEmptyString, [] ),

    1: new GeometryConfiguration(
      geometryDiatomicString,
      [
        new Vector3( 1, 0, 0 )
      ]
    ),
    2: new GeometryConfiguration(
      geometryLinearString,
      [
        new Vector3( 1, 0, 0 ),
        new Vector3( -1, 0, 0 )
      ]
    ),
    3: new GeometryConfiguration(
      geometryTrigonalPlanarString,
      [
        new Vector3( 1, 0, 0 ),
        new Vector3( Math.cos( Math.PI * 2 / 3 ), Math.sin( Math.PI * 2 / 3 ), 0 ),
        new Vector3( Math.cos( Math.PI * 4 / 3 ), Math.sin( Math.PI * 4 / 3 ), 0 )
      ]
    ),
    4: new GeometryConfiguration(
      geometryTetrahedralString,
      [
        new Vector3( 0, 0, 1 ),
        new Vector3( Math.cos( 0 ) * Math.cos( TETRA_CONST ), Math.sin( 0 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) ),
        new Vector3( Math.cos( Math.PI * 2 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( Math.PI * 2 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) ),
        new Vector3( Math.cos( Math.PI * 4 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( Math.PI * 4 / 3 ) * Math.cos( TETRA_CONST ), Math.sin( TETRA_CONST ) )
      ]
    ),
    5: new GeometryConfiguration(
      geometryTrigonalBipyramidalString,
      [
        // equitorial (fills up with lone pairs first)
        new Vector3( 0, 1, 0 ),
        new Vector3( 0, Math.cos( Math.PI * 2 / 3 ), Math.sin( Math.PI * 2 / 3 ) ),
        new Vector3( 0, Math.cos( Math.PI * 4 / 3 ), Math.sin( Math.PI * 4 / 3 ) ),

        // axial
        new Vector3( 1, 0, 0 ),
        new Vector3( -1, 0, 0 )
      ]
    ),
    6: new GeometryConfiguration(
      geometryOctahedralString,
      [
        // opposites first
        new Vector3( 0, 0, 1 ),
        new Vector3( 0, 0, -1 ),
        new Vector3( 0, 1, 0 ),
        new Vector3( 0, -1, 0 ),
        new Vector3( 1, 0, 0 ),
        new Vector3( -1, 0, 0 )
      ]
    )
  };

  GeometryConfiguration.getConfiguration = function( numberOfGroups ) {
    return geometries[numberOfGroups];
  };

  return GeometryConfiguration;
} );