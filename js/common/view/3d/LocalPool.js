// Copyright 2002-2014, University of Colorado Boulder

/**
 * Provides access to renderer-specific pools of objects (object pooling where objects with different renderers can't
 * be mixed).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /*
   * @constructor
   * @param {string} name - for debugging purposes
   * @param {(THREE.Renderer) => {*}} objectFactory - Creates an object when needed for the pool
   */
  function LocalPool( name, objectFactory ) {
    this.name = name;
    this.objectFactory = objectFactory;

    // renderers[i] "owns" objects[i]
    this.renderers = [];
    this.objects = [];

    this.quantityOutside = 0;
    this.quantityInside = 0;
  }

  return inherit( Object, LocalPool, {
    /*
     * @param {THREE.Renderer} renderer
     * @returns {*} - Either a fresh object, or one from the pool
     */
    get: function( renderer ) {
      assert && assert( renderer );

      for ( var i = 0; i < this.renderers.length; i++ ) {
        if ( this.renderers[ i ] === renderer ) {
          // remove it from the pool
          var object = this.objects[ i ];
          this.renderers.splice( i, 1 );
          this.objects.splice( i, 1 );
          this.quantityOutside++;
          this.quantityInside--;
          this.debug( 'from pool' );
          return object;
        }
      }

      // didn't find it in our pool
      this.quantityOutside++;
      this.debug( 'fresh' );
      return this.objectFactory( renderer );
    },

    /*
     * Returns an object to the pool
     *
     * @param {*} object
     * @param {THREE.Renderer} renderer
     */
    put: function( object, renderer ) {
      assert && assert( object && renderer );

      this.renderers.push( renderer );
      this.objects.push( object );
      this.quantityOutside--;
      this.quantityInside++;
      this.debug( 'return' );
    },

    // enable printing out pool counts (type,action,inPool,outOfPool) with ?dev
    debug: ( window.phetcommon.getQueryParameter( 'dev' ) ) ? function( action ) {
      console.log( this.name, action, this.quantityInside, this.quantityOutside );
    } : function() {}
  } );
} );
