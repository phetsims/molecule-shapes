// Copyright 2002-2014, University of Colorado Boulder

/**
 * Provides access to renderer-specific textures which are otherwise identical. We can't share textures across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );

  /*
   * @constructor
   * @param {() => {THREE.Texture}} textureFactory - Creates a texture whenever needed (for each renderer)
   */
  function LocalTexture( textureFactory ) {
    this.textureFactory = textureFactory;

    // renderers[i] "owns" textures[i]
    this.renderers = [];
    this.textures = [];
  }

  return inherit( Object, LocalTexture, {
    // @param {THREE.Renderer} renderer
    get: function( renderer ) {
      for ( var i = 0; i < this.renderers.length; i++ ) {
        if ( this.renderers[i] === renderer ) {
          return this.textures[i];
        }
      }

      this.renderers.push( renderer );
      var material = this.textureFactory();
      this.textures.push( material );

      return material;
    }
  } );
} );
