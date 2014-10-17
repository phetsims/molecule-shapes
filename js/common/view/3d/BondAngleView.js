// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type for views of the angle (sector and line) between two bonds (not including the displayed label)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Util = require( 'DOT/Util' );

  function BondAngleView( model, molecule, aGroup, bGroup ) {
    THREE.Object3D.call( this );

    // @public
    this.aGroup = aGroup;
    this.bGroup = bGroup;
    this.midpoint = null; // {Vector3} updated in updateView
    this.radius = 5;

    // @protected
    this.model = model;
    this.molecule = molecule;

    // @protected, updated in updateView super call
    this.viewOpacity = 0; // {number}
    this.viewAngle = 0; // {number}
    this.midpointUnit = null; // {Vector3}
    this.planarUnit = null; // {Vector3}
  }

  return inherit( THREE.Object3D, BondAngleView, {
    dispose: function() {

    },

    updateView: function( lastMidpoint, localCameraOrientation ) {
      var aDir = this.aGroup.orientation;
      var bDir = this.bGroup.orientation;

      this.viewOpacity = this.model.showBondAngles ? BondAngleView.calculateBrightness( aDir, bDir, localCameraOrientation, this.molecule.radialAtoms.length ) : 0;

      this.viewAngle = Math.acos( Util.clamp( aDir.dot( bDir ), -1, 1 ) );

      var isApproximateSemicircle = BondAngleView.isApproximateSemicircle( aDir, bDir );
      if ( isApproximateSemicircle ) {
        if ( !lastMidpoint ) {
          lastMidpoint = Vector3.Y_UNIT.times( BondAngleView.radius );
        }
        var lastMidpointDir = lastMidpoint.normalized();

        // find a vector that is as orthogonal to both directions as possible
        var badCross = aDir.cross( lastMidpointDir ).plus( lastMidpointDir.cross( bDir ) );
        var averageCross = badCross.magnitude() > 0 ? badCross.normalized() : new Vector3( 0, 0, 1 );

        // find a vector that gives us a balance between aDir and bDir (so our semicircle will balance out at the endpoints)
        var averagePointDir = aDir.minus( bDir ).normalized();

        // (basis vector 1) make that average point planar to our arc surface
        this.planarUnit = averagePointDir.minus( averageCross.times( averageCross.dot( averagePointDir ) ) ).normalized();

        // (basis vector 2) find a new midpoint direction that is planar to our arc surface
        this.midpointUnit = averageCross.cross( this.planarUnit ).normalized();
      } else {
        this.midpointUnit = aDir.plus( bDir ).normalized();
        this.planarUnit = aDir.minus( this.midpointUnit.times( aDir.dot( this.midpointUnit ) ) ).normalized();
      }

      this.midpoint = this.midpointUnit.times( BondAngleView.radius );
    },
  }, {
    lowThresholds: [0, 0, 0, 0, 0.35, 0.45, 0.5],
    highThresholds: [0, 0, 0, 0.5, 0.55, 0.65, 0.75],

    calculateBrightness: function( aDir, bDir, localCameraOrientation, bondQuantity ) {
      // if there are less than 3 bonds, always show the bond angle.
      if ( bondQuantity <= 2 ) {
        return 1;
      }

      // a combined measure of how close the angles are AND how orthogonal they are to the camera
      var brightness = Math.abs( aDir.cross( bDir ).dot( localCameraOrientation ) );

      var lowThreshold = BondAngleView.lowThresholds[bondQuantity];
      var highThreshold = BondAngleView.highThresholds[bondQuantity];

      var interpolatedValue = brightness / ( highThreshold - lowThreshold ) - lowThreshold / ( highThreshold - lowThreshold );

      return Util.clamp( interpolatedValue, 0, 1 );
    },

    isApproximateSemicircle: function( startDir, endDir ) {
      return Math.acos( Util.clamp( startDir.dot( endDir ), -1, 1 ) ) >= 3.12414;
    },

    // radius, in view units
    radius: 5
  } );
} );
