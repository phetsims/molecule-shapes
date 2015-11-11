// Copyright 2014-2015, University of Colorado Boulder

/**
 * Provides access to renderer-specific geometries which are otherwise identical. We can't share geometries across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );

  /*
   * @constructor
   * @param {THREE.Geometry} masterGeometry - The geometry to clone for each renderer
   */
  function LocalGeometry( masterGeometry ) {
    this.masterGeometry = masterGeometry;

    // renderers[i] "owns" geometries[i]
    this.renderers = [];
    this.geometries = [];
  }

  moleculeShapes.register( 'LocalGeometry', LocalGeometry );

  return inherit( Object, LocalGeometry, {
    // @param {THREE.Renderer} renderer
    get: function( renderer ) {
      for ( var i = 0; i < this.renderers.length; i++ ) {
        if ( this.renderers[ i ] === renderer ) {
          return this.geometries[ i ];
        }
      }

      this.renderers.push( renderer );
      var geometry = this.masterGeometry.clone();
      this.geometries.push( geometry );

      return geometry;
    }
  } );
} );
