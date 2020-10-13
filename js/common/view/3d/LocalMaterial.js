// Copyright 2014-2020, University of Colorado Boulder

/**
 * Provides access to renderer-specific materials which are otherwise identical. We can't share materials across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * Also provides ways to modify every copied material when uniforms/etc. needs to be changed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';

class LocalMaterial {
  /*
   * @param {THREE.Material} masterMaterial - The material to clone for each renderer
   */
  constructor( masterMaterial, options ) {

    options = merge( {
      // default options?
    }, options );

    this.masterMaterial = masterMaterial; // @private {THREE.Material}

    // renderers[i] "owns" materials[i]
    this.renderers = []; // @private {Array.<THREE.Renderer>}
    this.materials = []; // @private {Array.<THREE.Material>}

    if ( options.color ) {
      MoleculeShapesGlobals.toColorProperty( options.color ).link( color => {
        this.setColor( color );
      } );
    }
    // assumes RGB
    if ( options.uniformColor ) {
      MoleculeShapesGlobals.toColorProperty( options.uniformColor ).link( color => {
        this.setUniformColor( color );
      } );
    }
  }

  /**
   * Returns the copy of the material corresponding to the provided three.js renderer.
   * @public
   *
   * @param {THREE.Renderer} renderer
   * @returns {THREE.Material}
   */
  get( renderer ) {
    for ( let i = 0; i < this.renderers.length; i++ ) {
      if ( this.renderers[ i ] === renderer ) {
        return this.materials[ i ];
      }
    }

    this.renderers.push( renderer );
    const material = this.masterMaterial.clone();
    this.materials.push( material );

    return material;
  }

  /**
   * Sets the uniform value for the WebGL shader based on THREE.js's support for uniform values.
   * @public
   *
   * @param {string} name
   * @param {*} value
   */
  setUniform( name, value ) {
    this.masterMaterial.uniforms[ name ].value = value;
    _.each( this.materials, material => { material.uniforms[ name ].value = value; } );
  }

  /**
   * Sets the color for the materials (master material and the copies).
   * @public
   *
   * @param {Color} color
   */
  setColor( color ) {
    const hex = color.toNumber();
    this.masterMaterial.color.setHex( hex );
    _.each( this.materials, material => { material.color.setHex( hex ); } );
  }

  /**
   * Sets the uniform color for all materials.
   * @public
   *
   * @param {Color} color
   */
  setUniformColor( color ) {
    const colorArray = [ color.r / 255, color.g / 255, color.b / 255 ];
    this.setUniform( 'color', colorArray );
  }
}

moleculeShapes.register( 'LocalMaterial', LocalMaterial );

export default LocalMaterial;