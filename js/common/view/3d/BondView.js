// Copyright 2014-2017, University of Colorado Boulder

/**
 * View of a {Bond} bond {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var Vector3 = require( 'DOT/Vector3' );

  var NUM_RADIAL_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.get() ? 32 : 8;
  var NUM_AXIAL_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.get() ? 1 : 8;
  var globalBondGeometry = new THREE.CylinderGeometry( 1, 1, 1, NUM_RADIAL_SAMPLES, NUM_AXIAL_SAMPLES, false ); // 1 radius, 1 height, 32 segments, open-ended

  // renderer-local access
  var localBondGeometry = new LocalGeometry( globalBondGeometry );
  var localBondMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
    overdraw: MoleculeShapesGlobals.useWebGLProperty.get() ? 0 : 0.5 // amount to extend polygons when using Canvas to avoid cracks
  } ), {
    color: MoleculeShapesColorProfile.bondProperty
  } );

  /*
   * @constructor
   * @param {THREE.Renderer} renderer
   * @param {Bond.<PairGroup>} bond
   * @param {Property.<Vector3>} aPositionProperty - position of one end of the bond
   * @param {Property.<Vector3>} bPositionProperty - position of the other end of the bond
   * @param {number} bondRadius - in display units
   * @param {number | null} maxLength - in display units
   */
  function BondView( renderer, bond, aPositionProperty, bPositionProperty, bondRadius, maxLength ) {
    var self = this;

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

    for ( var i = 0; i < this.bondOrder; i++ ) {
      // they will have unit height and unit radius. We will scale, rotate and translate them later
      this.aBonds.push( new THREE.Mesh( this.bondGeometry, this.aMaterial ) );
      this.bBonds.push( new THREE.Mesh( this.bondGeometry, this.bMaterial ) );
    }

    THREE.Object3D.call( this );

    // bind won't work
    _.each( this.aBonds, function( bond ) { self.add( bond ); } );
    _.each( this.bBonds, function( bond ) { self.add( bond ); } );
  }

  moleculeShapes.register( 'BondView', BondView );

  return inherit( THREE.Object3D, BondView, {

    /**
     * Updates the BondView's appearance.
     * @public
     *
     * @param {THREE.Vector3} cameraPosition - The location of the camera in the molecule's local coordinate frame.
     */
    updateView: function( cameraPosition ) {
      // extract our start and end
      var start = this.aPositionProperty.value;
      var end = this.bPositionProperty.value;

      // unit vector point in the direction of the end from the start
      var towardsEnd = end.minus( start ).normalized();

      // calculate the length of the bond. sometimes it can be length-limited, and we push the bond towards B
      var distance = start.distance( end );
      var length;
      var overLength = 0;
      if ( this.maxLength !== null && distance > this.maxLength ) {
        // our bond would be too long
        length = this.maxLength;
        overLength = distance - this.maxLength;
      }
      else {
        length = distance;
      }

      // find the center of our bond. we add in the "over" length if necessary to offset the bond from between A and B
      var bondCenter = ( start.times( 0.5 ).plus( end.times( 0.5 ) ) ).plus( towardsEnd.times( overLength / 2 ) );

      // get a unit vector perpendicular to the bond direction and camera direction
      var perpendicular = bondCenter.minus( end ).normalized().cross( bondCenter.minus( cameraPosition ).normalized() ).normalized();

      /*
       * Compute offsets from the "central" bond position, for showing double and triple bonds.
       * The offsets are basically the relative positions of the 1/2/3 cylinders that are displayed as a bond.
       */
      var offsets;

      // how far bonds are apart. constant refined for visual appearance. triple-bonds aren't wider than atoms, most notably
      var bondSeparation = this.bondRadius * ( 12 / 5 );
      switch( this.bondOrder ) {
        case 1:
          offsets = [ new Vector3() ];
          break;
        case 2:
          offsets = [ perpendicular.times( bondSeparation / 2 ), perpendicular.times( -bondSeparation / 2 ) ];
          break;
        case 3:
          offsets = [ Vector3.ZERO, perpendicular.times( bondSeparation ), perpendicular.times( -bondSeparation ) ];
          break;
        default:
          throw new Error( 'bad bond order: ' + this.bondOrder );
      }

      // since we need to support two different colors (A-colored and B-colored), we need to compute the offsets from the bond center for each
      var colorOffset = towardsEnd.times( length / 4 );
      var threeZUnit = new THREE.Vector3( 0, 1, 0 );
      var threeTowardsEnd = new THREE.Vector3().copy( towardsEnd );

      for ( var i = 0; i < this.bondOrder; i++ ) {
        var aTranslation = bondCenter.plus( offsets[ i ] ).minus( colorOffset );
        var bTranslation = bondCenter.plus( offsets[ i ] ).plus( colorOffset );

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
  } );
} );
