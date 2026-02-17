// Copyright 2014-2023, University of Colorado Boulder

/**
 * Provides access to renderer-specific geometries which are otherwise identical. We can't share geometries across
 * three.js renderers, so we must resort to making one copy per renderer.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import moleculeShapes from '../../../moleculeShapes.js';

class LocalGeometry {
  /*
   * @param {THREE.Geometry} mainGeometry - The geometry to clone for each renderer
   */
  constructor( mainGeometry ) {
    this.mainGeometry = mainGeometry;

    // renderers[i] "owns" geometries[i]
    this.renderers = []; // @private {Array.<THREE.Renderer>}
    this.geometries = []; // @private {Array.<THREE.Geometry>}
  }

  /**
   * Returns the copy of the geometry corresponding to the provided three.js renderer.
   * @public
   *
   * @param {THREE.Renderer} renderer
   * @returns {THREE.Geometry}
   */
  get( renderer ) {
    for ( let i = 0; i < this.renderers.length; i++ ) {
      if ( this.renderers[ i ] === renderer ) {
        return this.geometries[ i ];
      }
    }

    this.renderers.push( renderer );
    const geometry = this.mainGeometry.clone();
    this.geometries.push( geometry );

    return geometry;
  }
}

moleculeShapes.register( 'LocalGeometry', LocalGeometry );

export default LocalGeometry;