// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type for views of the angle (sector and line) between two bonds (not including the displayed label)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector3 = require( 'DOT/Vector3' );
  var Util = require( 'DOT/Util' );

  /*
   * @constructor
   */
  function BondAngleView() {
    THREE.Object3D.call( this );
  }

  return inherit( THREE.Object3D, BondAngleView, {
    /*
     * @param {MoleculeShapesScreenView} screenView - We do various screen-space computations for positioning the labels
     * @param {Property.<boolean>} showBondAnglesProperty
     * @param {Molecule} molecule
     * @param {PairGroup} aGroup - The atom on one end of the bond angle
     * @param {PairGroup} bGroup - The atom on the other end of the bond angle
     * @param {LabelWebGLView | LabelFallbackNode} label - Supports label.setLabel( ... ) and label.unsetLabel(), see docs
     */
    initialize: function( screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label ) {
      // @public
      this.aGroup = aGroup;
      this.bGroup = bGroup;
      this.label = label;
      this.midpoint = null; // {Vector3} updated in updateView
      this.radius = 5;

      // @protected
      this.screenView = screenView;
      this.showBondAnglesProperty = showBondAnglesProperty;
      this.molecule = molecule;

      // @protected, updated in updateView super call
      this.viewOpacity = 0; // {number}
      this.viewAngle = 0; // {number}
      this.midpointUnit = null; // {Vector3}
      this.planarUnit = null; // {Vector3}
    },

    dispose: function() {
      // overridden in sub-types
    },

    /**
     * @param {Vector3} lastMidpoint - The midpoint of the last frame's bond angle arc, used to stabilize bond angles
     *                                 that are around ~180 degrees.
     * @param {Vector3} localCameraOrientation - A unit vector in the molecule's local coordiante space pointing
     *                                           to the camera.
     */
    updateView: function( lastMidpoint, localCameraOrientation ) {
      var aDir = this.aGroup.orientation;
      var bDir = this.bGroup.orientation;

      this.viewOpacity = this.showBondAnglesProperty.value ? BondAngleView.calculateBrightness( aDir, bDir, localCameraOrientation, this.molecule.radialAtoms.length ) : 0;

      // angle in radians between the two orientations, clamped to avoid Math.acos of something slightly greater than 1
      this.viewAngle = Math.acos( Util.clamp( aDir.dot( bDir ), -1, 1 ) );

      // If we have an approximate semicircle, we'll need to use the last midpoint to provide a stable position to
      // display the 180-degree semicircle. Otherwise, it would be unstable and wildly vary.
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
      }
      else {
        this.midpointUnit = aDir.plus( bDir ).normalized();
        this.planarUnit = aDir.minus( this.midpointUnit.times( aDir.dot( this.midpointUnit ) ) );
        // guard for zero-length bond case, see https://github.com/phetsims/molecule-shapes/issues/101
        if ( this.planarUnit.magnitude() > 0 ) {
          this.planarUnit.normalize();
        }
      }

      this.midpoint = this.midpointUnit.times( BondAngleView.radius );

      // label handling
      if ( this.viewOpacity !== 0 ) {
        var centerDevicePoint = new THREE.Vector3(); // e.g. zero
        var midDevicePoint = new THREE.Vector3().copy( this.midpoint );

        // transform to world coordinates
        this.parent.localToWorld( centerDevicePoint );
        this.parent.localToWorld( midDevicePoint );

        // TODO: failure of encapsulation here!
        // inverse projection into normalized device coordinates
        this.screenView.convertScreenPointFromGlobalPoint( centerDevicePoint );
        this.screenView.convertScreenPointFromGlobalPoint( midDevicePoint );
        var layoutScale = this.screenView.getLayoutScale( this.screenView.screenWidth, this.screenView.screenHeight );

        var angle = aDir.angleBetween( bDir ) * 180 / Math.PI;

        // screen coordinates
        var screenCenterPoint = new Vector2( ( centerDevicePoint.x + 1 ) * this.screenView.screenWidth / 2,
          ( -centerDevicePoint.y + 1 ) * this.screenView.screenHeight / 2 );
        var screenMidPoint = new Vector2( ( midDevicePoint.x + 1 ) * this.screenView.screenWidth / 2,
          ( -midDevicePoint.y + 1 ) * this.screenView.screenHeight / 2 );

        var labelString = Util.toFixed( angle, 1 ) + '°';
        while ( labelString.length < 5 ) {
          // handle single-digit labels by padding them
          labelString = '0' + labelString;
        }

        this.label.setLabel( labelString, this.viewOpacity, screenCenterPoint, screenMidPoint, layoutScale );
      }
      else {
        this.label.unsetLabel();
      }
    }
  }, {
    // dot product between the camera direction and bond angle normal is below LOW_THRESHOLDS[bondOrder] => alpha = 0
    // dot product between the camera direction and bond angle normal is above LOW_THRESHOLDS[HIGH_THRESHOLDS] => alpha = 1
    LOW_THRESHOLDS: [ 0, 0, 0, 0, 0.35, 0.45, 0.5 ],
    HIGH_THRESHOLDS: [ 0, 0, 0, 0.5, 0.55, 0.65, 0.75 ],

    /**
     * Determines the brightness (alpha) of a bond angle based on the orientations of the two radial atoms, the camera,
     * and the total number of bonds around our central atom.
     *
     * @param {Vector3} aDir - The unit vector pointing towards the first radial atom
     * @param {Vector3} bDir - The unit vector pointing towards the second radial atom
     * @param {Vector3} localCameraOrientation - A unit vector in the molecule's local coordiante space pointing
     *                                           to the camera.
     * @param {number} bondQuantity - The total number of bonds around the central atom
     */
    calculateBrightness: function( aDir, bDir, localCameraOrientation, bondQuantity ) {
      // if there are less than 3 bonds, always show the bond angle.
      if ( bondQuantity <= 2 ) {
        return 1;
      }

      // a combined measure of how close the angles are AND how orthogonal they are to the camera
      var brightness = Math.abs( aDir.cross( bDir ).dot( localCameraOrientation ) );

      var lowThreshold = BondAngleView.LOW_THRESHOLDS[ bondQuantity ];
      var highThreshold = BondAngleView.HIGH_THRESHOLDS[ bondQuantity ];

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
