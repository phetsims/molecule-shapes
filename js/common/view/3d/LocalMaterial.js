// Copyright 2002-2014, University of Colorado Boulder

/**
 * Provides access to renderer-specific materials which are otherwise identical. We can't share materials across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );

  /*
   * @constructor
   * @param {THREE.Material} masterMaterial - The material to clone for each renderer
   */
  function LocalMaterial( masterMaterial, options ) {
    var self = this;

    options = _.extend( {
      // default options?
    }, options );

    this.masterMaterial = masterMaterial;

    // renderers[i] "owns" materials[i]
    this.renderers = [];
    this.materials = [];

    if ( options.color ) {
      MoleculeShapesGlobals.toColorProperty( options.color ).link( function( color ) {
        self.setColor( color );
      } );
    }
    // assumes RGB
    if ( options.uniformColor ) {
      MoleculeShapesGlobals.toColorProperty( options.uniformColor ).link( function( color ) {
        self.setUniformColor( color );
      } );
    }
  }

  return inherit( Object, LocalMaterial, {
    get: function( renderer ) {
      for ( var i = 0; i < this.renderers.length; i++ ) {
        if ( this.renderers[ i ] === renderer ) {
          return this.materials[ i ];
        }
      }

      this.renderers.push( renderer );
      var material = this.masterMaterial.clone();
      this.materials.push( material );

      return material;
    },

    // Sets the uniform value for the WebGL shader based on THREE.js's support for uniform values.
    setUniform: function( name, value ) {
      this.masterMaterial.uniforms[ name ].value = value;
      _.each( this.materials, function( material ) { material.uniforms[ name ].value = value; } );
    },

    setColor: function( color ) {
      var hex = color.toNumber();
      this.masterMaterial.color.setHex( hex );
      _.each( this.materials, function( material ) { material.color.setHex( hex ); } );
    },

    setUniformColor: function( color ) {
      var colorArray = [ color.r / 255, color.g / 255, color.b / 255 ];
      this.setUniform( 'color', colorArray );
    }
  } );
} );
