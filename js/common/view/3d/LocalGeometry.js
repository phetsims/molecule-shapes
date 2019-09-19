// Copyright 2014-2017, University of Colorado Boulder

/**
 * Provides access to renderer-specific geometries which are otherwise identical. We can't share geometries across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );

  /*
   * @constructor
   * @param {THREE.Geometry} masterGeometry - The geometry to clone for each renderer
   */
  function LocalGeometry( masterGeometry ) {
    this.masterGeometry = masterGeometry;

    // renderers[i] "owns" geometries[i]
    this.renderers = []; // @private {Array.<THREE.Renderer>}
    this.geometries = []; // @private {Array.<THREE.Geometry>}
  }

  moleculeShapes.register( 'LocalGeometry', LocalGeometry );

  return inherit( Object, LocalGeometry, {
    /**
     * Returns the copy of the geometry corresponding to the provided three.js renderer.
     * @public
     *
     * @param {THREE.Renderer} renderer
     * @returns {THREE.Geometry}
     */
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
