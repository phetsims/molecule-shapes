// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of a {Bond} bond {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Color = require( 'SCENERY/util/Color' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );


  // maxLength is a number or null
  function BondView( aPositionProperty, bPositionProperty, bondOrder, bondRadius, maxLength, aColor, bColor ) {
    var view = this;

    var aColor = new Color( aColor ).toNumber();
    var bColor = new Color( bColor ).toNumber();

    var aMaterial = new THREE.MeshLambertMaterial( {
      color: aColor,
      ambient: aColor
    } );
    var bMaterial = new THREE.MeshLambertMaterial( {
      color: bColor,
      ambient: bColor
    } );

    var cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 1, 16, 1, false ); // 1 radius, 1 height, 16 segments, open-ended

    this.aPositionProperty = aPositionProperty;
    this.bPositionProperty = bPositionProperty;
    this.bondOrder = bondOrder;
    this.bondRadius = bondRadius;
    this.maxLength = maxLength;
    this.aColor = aColor;
    this.bColor = bColor;

    this.aBonds = [];
    this.bBonds = [];

    for ( var i = 0; i < bondOrder; i++ ) {
      // they will have unit height and unit radius. We will scale, rotate and translate them later
      this.aBonds.push( new THREE.Mesh( cylinderGeometry, aMaterial ) );
      this.bBonds.push( new THREE.Mesh( cylinderGeometry, bMaterial ) );
    }

    var geometry = new THREE.SphereGeometry( 2, 64, 64 ); // may set to 32,32 for performance?

    THREE.Object3D.call( this );

    // bind won't work
    _.each( this.aBonds, function( bond ) { view.add( bond ); } );
    _.each( this.bBonds, function( bond ) { view.add( bond ); } );

    this.updateView();
  }

  return inherit( THREE.Object3D, BondView, {
    updateView: function() {
      var cameraPosition = new THREE.Vector3().copy( MoleculeShapesScreenView.cameraPosition ); // this SETS cameraPosition
      this.worldToLocal( cameraPosition ); // this mutates cameraPosition

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
      switch ( this.bondOrder ) {
        case 1:
          offsets = [new Vector3()];
          break;
        case 2:
          offsets = [perpendicular.times( bondSeparation / 2 ), perpendicular.times( -bondSeparation / 2 )];
          break;
        case 3:
          offsets = [Vector3.ZERO, perpendicular.times( bondSeparation ), perpendicular.times( -bondSeparation )];
          break;
        default:
          throw new Error( 'bad bond order: ' + this.bondOrder );
      }

      // since we need to support two different colors (A-colored and B-colored), we need to compute the offsets from the bond center for each
      var colorOffset = towardsEnd.times( length / 4 );
      var threeZUnit = new THREE.Vector3( 0, 1, 0 );
      var threeTowardsEnd = new THREE.Vector3( towardsEnd.x, towardsEnd.y, towardsEnd.z );

      for ( var i = 0; i < this.bondOrder; i++ ) {
        var aTranslation = bondCenter.plus( offsets[i] ).minus( colorOffset );
        var bTranslation = bondCenter.plus( offsets[i] ).plus( colorOffset );

        this.aBonds[i].position.set( aTranslation.x, aTranslation.y, aTranslation.z );
        this.bBonds[i].position.set( bTranslation.x, bTranslation.y, bTranslation.z );

        this.aBonds[i].quaternion.setFromUnitVectors( threeZUnit, threeTowardsEnd );
        this.bBonds[i].quaternion.setFromUnitVectors( threeZUnit, threeTowardsEnd );

        this.aBonds[i].scale.x = this.aBonds[i].scale.z = this.bondRadius;
        this.bBonds[i].scale.x = this.bBonds[i].scale.z = this.bondRadius;

        this.aBonds[i].scale.y = this.bBonds[i].scale.y = length / 2;

        // var rotation = Matrix4F.fromMatrix3f( QuaternionF.getRotationQuaternion( Vector3.Z_UNIT, towardsEnd ).toRotationMatrix() );

        // var aMatrix = Matrix4F.translation( bondCenter.plus( offsets[i] ).minus( colorOffset ) )
        //                 // point the cylinder in the direction of the bond. Cylinder is symmetric, so sign doesn't matter
        //                 .times( Matrix4F.fromMatrix3f( QuaternionF.getRotationQuaternion( Vector3.Z_UNIT, towardsEnd ).toRotationMatrix() ) )
        //                 // since our cylinders point along the Z direction and have unit-length and unit-radius, we scale it out to the desired radius and half-length
        //                 .times( Matrix4F.scaling( this.bondRadius, this.bondRadius, length / 2 ) );
        // // this time, add in the color offset instead of subtracting
        // var bMatrix = Matrix4F.translation( bondCenter.plus( offsets[i] ).plus( colorOffset ) )
        //                 .times( Matrix4F.fromMatrix3f( QuaternionF.getRotationQuaternion( Vector3.Z_UNIT, towardsEnd ).toRotationMatrix() ) )
        //                 .times( Matrix4F.scaling( this.bondRadius, this.bondRadius, length / 2 ) );

        // this.aBonds[i].transform.set( );
        // this.bBonds[i].transform.set( );

        this.aBonds[i].updateMatrix();
        this.bBonds[i].updateMatrix();
      }
    }
  } );
} );
