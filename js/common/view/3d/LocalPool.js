// Copyright 2002-2014, University of Colorado Boulder

/**
 * Provides access to renderer-specific pools of objects (object pooling where objects with different renderers can't
 * be mixed).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );

  /*
   * @constructor
   * @param {(THREE.Renderer) => {*}} objectFactory - Creates an object when needed for the pool
   */
  function LocalPool( objectFactory ) {
    this.objectFactory = objectFactory;

    // renderers[i] "owns" objects[i]
    this.renderers = [];
    this.objects = [];
  }

  return inherit( Object, LocalPool, {
    /*
     * @param {THREE.Renderer} renderer
     * @returns {*} - Either a fresh object, or one from the pool
     */
    get: function( renderer ) {
      for ( var i = 0; i < this.renderers.length; i++ ) {
        if ( this.renderers[i] === renderer ) {
          // remove it from the pool
          var object = this.objects[i];
          this.renderers.splice( i, 1 );
          this.objects.splice( i, 1 );
          return object;
        }
      }

      // didn't find it in our pool
      return this.objectFactory( renderer );
    },

    /*
     * Returns an object to the pool
     *
     * @param {*} object
     * @param {THREE.Renderer} renderer
     */
    put: function( object, renderer ) {
      this.renderers.push( renderer );
      this.objects.push( object );
    }
  } );
} );
