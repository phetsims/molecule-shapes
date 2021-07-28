// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of a {Bond} bond {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../../dot/js/Vector3.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import LocalGeometry from './LocalGeometry.js';
import LocalMaterial from './LocalMaterial.js';

const NUM_RADIAL_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.value ? 32 : 8;
const NUM_AXIAL_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.value ? 1 : 8;
const globalBondGeometry = new THREE.CylinderGeometry( 1, 1, 1, NUM_RADIAL_SAMPLES, NUM_AXIAL_SAMPLES, false ); // 1 radius, 1 height, 32 segments, open-ended

// renderer-local access
const localBondGeometry = new LocalGeometry( globalBondGeometry );
const localBondMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
  overdraw: MoleculeShapesGlobals.useWebGLProperty.value ? 0 : 0.5 // amount to extend polygons when using Canvas to avoid cracks
} ), {
  color: MoleculeShapesColors.bondProperty
} );

class BondView extends THREE.Object3D {
  /*
   * @param {THREE.Renderer} renderer
   * @param {Bond.<PairGroup>} bond
   * @param {Property.<Vector3>} aPositionProperty - position of one end of the bond
   * @param {Property.<Vector3>} bPositionProperty - position of the other end of the bond
   * @param {number} bondRadius - in display units
   * @param {number|null} maxLength - in display units
   */
  constructor( renderer, bond, aPositionProperty, bPositionProperty, bondRadius, maxLength ) {

    super();

    this.aMaterial = localBondMaterial.get( renderer ); // @private {THREE.Material}
    this.bMaterial = localBondMaterial.get( renderer ); // @private {THREE.Material}
    this.bondGeometry = localBondGeometry.get( renderer ); // @private {THREE.Geometry}

    this.bond = bond; // @public {Bond.<PairGroup>}
    this.aPositionProperty = aPositionProperty; // @private {Property.<Vector3>}
    this.bPositionProperty = bPositionProperty; // @private {Property.<Vector3>}
    this.bondOrder = bond.order; // @public {number}
    this.bondRadius = bondRadius; // @public {number}
    this.maxLength = maxLength; // @private {number}

    this.aBonds = []; // @private {Array.<THREE.Mesh>}
    this.bBonds = []; // @private {Array.<THREE.Mesh>}

    for ( let i = 0; i < this.bondOrder; i++ ) {
      // they will have unit height and unit radius. We will scale, rotate and translate them later
      this.aBonds.push( new THREE.Mesh( this.bondGeometry, this.aMaterial ) );
      this.bBonds.push( new THREE.Mesh( this.bondGeometry, this.bMaterial ) );
    }

    // bind won't work
    _.each( this.aBonds, bond => { this.add( bond ); } );
    _.each( this.bBonds, bond => { this.add( bond ); } );
  }

  /**
   * Updates the BondView's appearance.
   * @public
   *
   * @param {THREE.Vector3} cameraPosition - The position of the camera in the molecule's local coordinate frame.
   */
  updateView( cameraPosition ) {
    // extract our start and end
    const start = this.aPositionProperty.value;
    const end = this.bPositionProperty.value;

    // unit vector point in the direction of the end from the start
    const towardsEnd = end.minus( start ).normalized();

    // calculate the length of the bond. sometimes it can be length-limited, and we push the bond towards B
    const distance = start.distance( end );
    let length;
    let overLength = 0;
    if ( this.maxLength !== null && distance > this.maxLength ) {
      // our bond would be too long
      length = this.maxLength;
      overLength = distance - this.maxLength;
    }
    else {
      length = distance;
    }

    // find the center of our bond. we add in the "over" length if necessary to offset the bond from between A and B
    const bondCenter = ( start.times( 0.5 ).plus( end.times( 0.5 ) ) ).plus( towardsEnd.times( overLength / 2 ) );

    // get a unit vector perpendicular to the bond direction and camera direction
    const perpendicular = bondCenter.minus( end ).normalized().cross( bondCenter.minus( cameraPosition ).normalized() ).normalized();

    /*
     * Compute offsets from the "central" bond position, for showing double and triple bonds.
     * The offsets are basically the relative positions of the 1/2/3 cylinders that are displayed as a bond.
     */
    let offsets;

    // how far bonds are apart. constant refined for visual appearance. triple-bonds aren't wider than atoms, most notably
    const bondSeparation = this.bondRadius * ( 12 / 5 );
    switch( this.bondOrder ) {
      case 1:
        offsets = [ new Vector3( 0, 0, 0 ) ];
        break;
      case 2:
        offsets = [ perpendicular.times( bondSeparation / 2 ), perpendicular.times( -bondSeparation / 2 ) ];
        break;
      case 3:
        offsets = [ Vector3.ZERO, perpendicular.times( bondSeparation ), perpendicular.times( -bondSeparation ) ];
        break;
      default:
        throw new Error( `bad bond order: ${this.bondOrder}` );
    }

    // since we need to support two different colors (A-colored and B-colored), we need to compute the offsets from the bond center for each
    const colorOffset = towardsEnd.times( length / 4 );
    const threeZUnit = new THREE.Vector3( 0, 1, 0 );
    const threeTowardsEnd = new THREE.Vector3().copy( towardsEnd );

    for ( let i = 0; i < this.bondOrder; i++ ) {
      const aTranslation = bondCenter.plus( offsets[ i ] ).minus( colorOffset );
      const bTranslation = bondCenter.plus( offsets[ i ] ).plus( colorOffset );

      this.aBonds[ i ].position.set( aTranslation.x, aTranslation.y, aTranslation.z );
      this.bBonds[ i ].position.set( bTranslation.x, bTranslation.y, bTranslation.z );

      this.aBonds[ i ].quaternion.setFromUnitVectors( threeZUnit, threeTowardsEnd );
      this.bBonds[ i ].quaternion.setFromUnitVectors( threeZUnit, threeTowardsEnd );

      this.aBonds[ i ].scale.x = this.aBonds[ i ].scale.z = this.bondRadius;
      this.bBonds[ i ].scale.x = this.bBonds[ i ].scale.z = this.bondRadius;

      this.aBonds[ i ].scale.y = this.bBonds[ i ].scale.y = length / 2;

      this.aBonds[ i ].updateMatrix();
      this.bBonds[ i ].updateMatrix();
    }
  }
}

moleculeShapes.register( 'BondView', BondView );

export default BondView;
