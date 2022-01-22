// Copyright 2014-2022, University of Colorado Boulder

/**
 * Base type for views of the angle (sector and line) between two bonds (not including the displayed label)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector3 from '../../../../../dot/js/Vector3.js';
import { animatedPanZoomSingleton } from '../../../../../scenery/js/imports.js';
import moleculeShapes from '../../../moleculeShapes.js';
import PairGroup from '../../model/PairGroup.js';

class BondAngleView extends THREE.Object3D {
  /**
   * @public
   *
   * @param {MoleculeShapesScreenView} screenView - We do various screen-space computations for positioning the labels
   * @param {Property.<boolean>} showBondAnglesProperty
   * @param {Molecule} molecule
   * @param {PairGroup} aGroup - The atom on one end of the bond angle
   * @param {PairGroup} bGroup - The atom on the other end of the bond angle
   * @param {LabelWebGLView|LabelFallbackNode} label - Supports label.setLabel( ... ) and label.unsetLabel(), see docs
   */
  initialize( screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label ) {
    assert && assert( aGroup instanceof PairGroup );
    assert && assert( bGroup instanceof PairGroup );

    this.aGroup = aGroup; // @public {PairGroup|null} - Atom on one end of the bond angle
    this.bGroup = bGroup; // @public {PairGroup|null} - Atom on the other end of the bond angle
    this.label = label; // @public {LabelWebGLView|LabelFallbackNode}
    this.midpoint = null; // @public {Vector3} - Updated in updateView
    this.radius = 5; // @public {number}

    this.screenView = screenView; // @protected {MoleculeShapesScreenView}
    this.showBondAnglesProperty = showBondAnglesProperty; // @protected {Property.<boolean>}
    this.molecule = molecule; // @protected {Molecule}

    this.viewOpacity = 0; // @protected {number} - Updated in updateView super call
    this.viewAngle = 0; // @protected {number} - Updated in updateView super call
    this.midpointUnit = null; // @protected {Vector3} - Updated in updateView super call
    this.planarUnit = null; // @protected {Vector3} - Updated in updateView super call
  }

  /**
   * Disposes the view, so that it can be reinitialized (pooling).
   * @public
   */
  dispose() {
    this.aGroup = null;
    this.bGroup = null;

    // overridden in sub-types
  }

  /**
   * Updates the bond-angle view based on previous information.
   * @public
   *
   * @param {Vector3|null} lastMidpoint - The midpoint of the last frame's bond angle arc, used to stabilize bond angles
   *                                      that are around ~180 degrees.
   * @param {Vector3} localCameraOrientation - A unit vector in the molecule's local coordiante space pointing
   *                                           to the camera.
   */
  updateView( lastMidpoint, localCameraOrientation ) {
    const aDir = this.aGroup.orientation;
    const bDir = this.bGroup.orientation;

    this.viewOpacity = this.showBondAnglesProperty.value ? BondAngleView.calculateBrightness( aDir, bDir, localCameraOrientation, this.molecule.radialAtoms.length ) : 0;

    // angle in radians between the two orientations, clamped to avoid Math.acos of something slightly greater than 1
    this.viewAngle = Math.acos( Utils.clamp( aDir.dot( bDir ), -1, 1 ) );

    // If we have an approximate semicircle, we'll need to use the last midpoint to provide a stable position to
    // display the 180-degree semicircle. Otherwise, it would be unstable and wildly vary.
    const isApproximateSemicircle = BondAngleView.isApproximateSemicircle( aDir, bDir );
    if ( isApproximateSemicircle ) {
      if ( !lastMidpoint ) {
        lastMidpoint = Vector3.Y_UNIT.times( BondAngleView.radius );
      }
      const lastMidpointDir = lastMidpoint.normalized();

      // find a vector that is as orthogonal to both directions as possible
      const badCross = aDir.cross( lastMidpointDir ).plus( lastMidpointDir.cross( bDir ) );
      const averageCross = badCross.magnitude > 0 ? badCross.normalized() : new Vector3( 0, 0, 1 );

      // find a vector that gives us a balance between aDir and bDir (so our semicircle will balance out at the endpoints)
      const averagePointDir = aDir.minus( bDir ).normalized();

      // (basis vector 1) make that average point planar to our arc surface
      this.planarUnit = averagePointDir.minus( averageCross.times( averageCross.dot( averagePointDir ) ) ).normalized();

      // (basis vector 2) find a new midpoint direction that is planar to our arc surface
      this.midpointUnit = averageCross.cross( this.planarUnit ).normalized();
    }
    else {
      this.midpointUnit = aDir.plus( bDir ).normalized();
      this.planarUnit = aDir.minus( this.midpointUnit.times( aDir.dot( this.midpointUnit ) ) );
      // guard for zero-length bond case, see https://github.com/phetsims/molecule-shapes/issues/101
      if ( this.planarUnit.magnitude > 0 ) {
        this.planarUnit.normalize();
      }
    }

    this.midpoint = this.midpointUnit.times( BondAngleView.radius );

    // label handling
    if ( this.viewOpacity !== 0 ) {
      const centerDevicePoint = new THREE.Vector3(); // e.g. zero
      const midDevicePoint = new THREE.Vector3().copy( this.midpoint );

      // transform to world coordinates
      this.parent.localToWorld( centerDevicePoint );
      this.parent.localToWorld( midDevicePoint );

      // TODO: failure of encapsulation here!
      // inverse projection into normalized device coordinates
      this.screenView.convertScreenPointFromGlobalPoint( centerDevicePoint );
      this.screenView.convertScreenPointFromGlobalPoint( midDevicePoint );
      const layoutScale = this.screenView.getLayoutScale( new Bounds2( 0, 0, this.screenView.screenWidth, this.screenView.screenHeight ) ) * animatedPanZoomSingleton.listener.matrixProperty.value.getScaleVector().x;

      const angle = aDir.angleBetween( bDir ) * 180 / Math.PI;

      // Potential fix for https://github.com/phetsims/molecule-shapes/issues/145.
      // The THREE.Vector3.project( THREE.Camera ) is giving is nonsense near startup. Longer-term could identify, but
      // switching bonds to true very quickly might cause this.
      if ( isFinite( centerDevicePoint.x ) && isFinite( centerDevicePoint.y ) ) {
        // screen coordinates
        const screenCenterPoint = new Vector2( ( centerDevicePoint.x + 1 ) * this.screenView.screenWidth / 2,
          ( -centerDevicePoint.y + 1 ) * this.screenView.screenHeight / 2 );
        const screenMidPoint = new Vector2( ( midDevicePoint.x + 1 ) * this.screenView.screenWidth / 2,
          ( -midDevicePoint.y + 1 ) * this.screenView.screenHeight / 2 );

        let labelString = `${Utils.toFixed( angle, 1 )}°`;
        while ( labelString.length < 5 ) {
          // handle single-digit labels by padding them
          labelString = `0${labelString}`;
        }

        this.label.setLabel( labelString, this.viewOpacity, screenCenterPoint, screenMidPoint, layoutScale );
      }
      else {
        this.label.unsetLabel();
      }

    }
    else {
      this.label.unsetLabel();
    }
  }

  // @public

  /**
   * Determines the brightness (alpha) of a bond angle based on the orientations of the two radial atoms, the camera,
   * and the total number of bonds around our central atom.
   * @public
   *
   * @param {Vector3} aDir - The unit vector pointing towards the first radial atom
   * @param {Vector3} bDir - The unit vector pointing towards the second radial atom
   * @param {Vector3} localCameraOrientation - A unit vector in the molecule's local coordiante space pointing
   *                                           to the camera.
   * @param {number} bondQuantity - The total number of bonds around the central atom
   */
  static calculateBrightness( aDir, bDir, localCameraOrientation, bondQuantity ) {
    // if there are less than 3 bonds, always show the bond angle.
    if ( bondQuantity <= 2 ) {
      return 1;
    }

    // a combined measure of how close the angles are AND how orthogonal they are to the camera
    const brightness = Math.abs( aDir.cross( bDir ).dot( localCameraOrientation ) );

    const lowThreshold = BondAngleView.LOW_THRESHOLDS[ bondQuantity ];
    const highThreshold = BondAngleView.HIGH_THRESHOLDS[ bondQuantity ];

    const interpolatedValue = brightness / ( highThreshold - lowThreshold ) - lowThreshold / ( highThreshold - lowThreshold );

    return Utils.clamp( interpolatedValue, 0, 1 );
  }

  /**
   * Whether our condition for semicircle (almost 180-degree bond angle) is met, as we need to stabilize the
   * positioning in this case.
   * @private
   *
   * @param {Vector3} startDir
   * @param {Vector3} endDir
   * @returns {boolean}
   */
  static isApproximateSemicircle( startDir, endDir ) {
    return Math.acos( Utils.clamp( startDir.dot( endDir ), -1, 1 ) ) >= 3.12414;
  }
}

// dot product between the camera direction and bond angle normal is below LOW_THRESHOLDS[bondOrder] => alpha = 0
// dot product between the camera direction and bond angle normal is above LOW_THRESHOLDS[HIGH_THRESHOLDS] => alpha = 1
BondAngleView.LOW_THRESHOLDS = [ 0, 0, 0, 0.1, 0.35, 0.45, 0.5 ]; // @public
BondAngleView.HIGH_THRESHOLDS = [ 0, 0, 0, 0.5, 0.55, 0.65, 0.75 ];

// @public {number} - radius, in view units
BondAngleView.radius = 5;

moleculeShapes.register( 'BondAngleView', BondAngleView );

export default BondAngleView;