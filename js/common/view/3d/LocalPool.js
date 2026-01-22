// Copyright 2014-2016, University of Colorado Boulder

/**
 * Provides access to renderer-specific pools of objects (object pooling where objects with different renderers can't
 * be mixed).
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
   * @param {string} name - for debugging purposes
   * @param {(THREE.Renderer) => {*}} objectFactory - Creates an object when needed for the pool
   */
  function LocalPool( name, objectFactory ) {
    this.name = name; // @private {string}
    this.objectFactory = objectFactory; // @private {(THREE.Renderer) => {*}}

    // renderers[i] "owns" objects[i]
    this.renderers = []; // @private {Array.<THREE.Renderer>}
    this.objects = []; // @private {Array.<*>}

    this.quantityOutside = 0; // @private
    this.quantityInside = 0; // @private
  }

  moleculeShapes.register( 'LocalPool', LocalPool );

  return inherit( Object, LocalPool, {
    /*
     * Returns the copy of the object corresponding to the provided three.js renderer.
     * @public
     *
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
     * @public
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

    /**
     * Enable printing out pool counts (type,action,inPool,outOfPool) with ?dev
     * @private
     */
    debug: ( phet.chipper.getQueryParameter( 'dev' ) ) ? function( action ) {
      console.log( this.name, action, this.quantityInside, this.quantityOutside );
    } : function() {}
  } );
} );
