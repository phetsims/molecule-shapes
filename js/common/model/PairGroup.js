// Copyright 2013-2021, University of Colorado Boulder

/**
 * A pair of electrons in VSEPR, which are either an atom (the electrons are constrained by the bond) or a lone pair.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import merge from '../../../../phet-core/js/merge.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import moleculeShapes from '../../moleculeShapes.js';

let nextId = 0;

class PairGroup {
  /**
   * @param {Vector3} position - Initial position
   * @param {boolean} isLonePair - True for a lone pair, false for an atom
   * @param {Object} [options] - See in the constructor for more information
   */
  constructor( position, isLonePair, options ) {
    options = merge( {
      // {Element|null} - The NITROGLYCERIN element if applicable (e.g. real model), or null if there is no element.
      element: null
    }, options );

    // @public {number} - Unique identifier.
    this.id = nextId++;

    // @public {Property.<Vector3>}
    this.positionProperty = new Property( position );

    // @public {Property.<Vector3>}
    this.velocityProperty = new Property( Vector3.ZERO );

    // @public {Property.<boolean>} - Whether the user is directly manipulating the position currently.
    this.userControlledProperty = new BooleanProperty( false );

    // @public (read-only) {Vector3} - Normalized position (unit vector).
    this.orientation = new Vector3( 0, 0, 0 );

    this.positionProperty.link( position => {
      this.orientation.set( position );

      if ( position.magnitude > 0 ) {
        this.orientation.normalize();
      }
    } );

    // @public {boolean}
    this.isLonePair = isLonePair;

    // @public {boolean} - Might be overridden to true by Molecule.addCentralAtom().
    this.isCentralAtom = false;

    // @public {Element|undefined} - undefined for VSEPR pair group
    this.element = options.element;

    if ( assert ) {
      this.positionProperty.lazyLink( ( newValue, oldValue ) => {
        assert && assert( !isNaN( newValue.x ), 'NaN detected in position!' );
      } );
      this.velocityProperty.lazyLink( ( newValue, oldValue ) => {
        assert && assert( !isNaN( newValue.x ), 'NaN detected in velocity!' );
      } );
    }
  }

  /**
   * Applies a damped spring-like system to move this pair group towards the "ideal" distance from its parent atom.
   * @public
   *
   * @param {number} timeElapsed - Amount of time the attraction is to be applied over
   * @param {number} oldDistance - Previous distance from the pair group to its parent atom
   * @param {Bond} bond - Bond to the parent atom
   */
  attractToIdealDistance( timeElapsed, oldDistance, bond ) {
    if ( this.userControlledProperty.value ) {
      // don't process if being dragged
      return;
    }
    const origin = bond.getOtherAtom( this ).positionProperty.value;

    const isTerminalLonePair = !origin.equals( Vector3.ZERO );

    const idealDistanceFromCenter = bond.length;

    /*---------------------------------------------------------------------------*
     * prevent movement away from our ideal distance
     *----------------------------------------------------------------------------*/
    const currentError = Math.abs( ( this.positionProperty.value.minus( origin ) ).magnitude - idealDistanceFromCenter );
    const oldError = Math.abs( oldDistance - idealDistanceFromCenter );
    if ( currentError > oldError ) {
      // our error is getting worse! for now, don't let us slide AWAY from the ideal distance ever
      // set our distance to the old one, so it is easier to process
      this.positionProperty.value = this.orientation.times( oldDistance ).plus( origin );
    }

    /*---------------------------------------------------------------------------*
     * use damped movement towards our ideal distance
     *----------------------------------------------------------------------------*/
    const toCenter = this.positionProperty.value.minus( origin );

    const distance = toCenter.magnitude;
    if ( distance !== 0 ) {
      const directionToCenter = toCenter.normalized();

      const offset = idealDistanceFromCenter - distance;

      // just modify position for now so we don't get any oscillations
      let ratioOfMovement = Math.min( 0.1 * timeElapsed / 0.016, 1 );
      if ( isTerminalLonePair ) {
        ratioOfMovement = 1;
      }
      this.positionProperty.value = this.positionProperty.value.plus( directionToCenter.times( ratioOfMovement * offset ) );
    }
  }

  /**
   * Returns the repulsion impulse (force * time) for the repulsion applied to this pair from FROM the provided
   * pair group.
   * @public
   *
   * @param {PairGroup} other - The pair group whose force on this object we want
   * @param {number} timeElapsed - Time elapsed (thus we return an impulse instead of a force)
   * @param {number} trueLengthsRatioOverride - From 0 to 1. If 0, lone pairs will behave the same as bonds. If 1, lone pair
   *                                            distance will be taken into account
   * @returns Repulsion force on this pair group, from the other pair group
   */
  getRepulsionImpulse( other, timeElapsed, trueLengthsRatioOverride ) {
    // only handle the force on this object for now

    // If the positions overlap, just let the attraction take care of things. See https://github.com/phetsims/molecule-shapes/issues/136
    if ( this.positionProperty.value.equalsEpsilon( other.positionProperty.value, 1e-6 ) ) {
      return new Vector3( 0, 0, 0 );
    }

    /*---------------------------------------------------------------------------*
     * adjust the logical positions when the repulsion modifier is less than 1
     *
     * (this allows us to get the "VSEPR" correct geometry even with lone pairs.
     * since lone pairs are closer in, an actual Coulomb model would diverge from
     * the VSEPR model angles. Here, we converge to the model VSEPR behavior, but
     * allow correct Coulomb calculations at greater distances
     *----------------------------------------------------------------------------*/

    // adjusted distances from the center atom
    const adjustedMagnitude = interpolate( PairGroup.BONDED_PAIR_DISTANCE, this.positionProperty.value.magnitude, trueLengthsRatioOverride );
    const adjustedOtherMagnitude = interpolate( PairGroup.BONDED_PAIR_DISTANCE, other.positionProperty.value.magnitude, trueLengthsRatioOverride );

    // adjusted positions
    const adjustedPosition = this.orientation.times( adjustedMagnitude );
    const adjustedOtherPosition = other.positionProperty.value.magnitude === 0 ? new Vector3( 0, 0, 0 ) : other.orientation.times( adjustedOtherMagnitude );

    // from other => this (adjusted)
    const delta = adjustedPosition.minus( adjustedOtherPosition );

    /*---------------------------------------------------------------------------*
     * coulomb repulsion
     *----------------------------------------------------------------------------*/

    // mimic Coulomb's Law
    const coulombVelocityDelta = delta.withMagnitude( timeElapsed * PairGroup.ELECTRON_PAIR_REPULSION_SCALE / ( delta.magnitude * delta.magnitude ) );

    // apply a nonphysical reduction on coulomb's law when the frame-rate is low, so we can avoid oscillation
    const coulombDowngrade = PairGroup.getTimescaleImpulseFactor( timeElapsed );
    return coulombVelocityDelta.times( coulombDowngrade );
  }

  /**
   * Applies a repulsive force from another PairGroup to this PairGroup.
   * @public
   *
   * @param {PairGroup} other - The pair group whose force on this object we want
   * @param {number} timeElapsed - Time elapsed (thus we return an impulse instead of a force)
   * @param {number} trueLengthsRatioOverride - From 0 to 1. If 0, lone pairs will behave the same as bonds. If 1, lone pair
   *                                            distance will be taken into account
   */
  repulseFrom( other, timeElapsed, trueLengthsRatioOverride ) {
    this.addVelocity( this.getRepulsionImpulse( other, timeElapsed, trueLengthsRatioOverride ) );
  }

  /**
   * Adds a change to our position if this PairGroup can have non-user-controlled changes.
   * @public
   *
   * @param {Vector3} positionChange
   */
  addPosition( positionChange ) {
    // don't allow velocity changes if we are dragging it, OR if it is an atom at the origin
    if ( !this.userControlledProperty.value && !this.isCentralAtom ) {
      this.positionProperty.value = this.positionProperty.value.plus( positionChange );
    }
  }

  /**
   * Adds a change to our velocity if this PairGroup can have non-user-controlled changes.
   * @public
   *
   * @param {Vector3} velocityChange
   */
  addVelocity( velocityChange ) {
    // don't allow velocity changes if we are dragging it, OR if it is an atom at the origin
    if ( !this.userControlledProperty.value && !this.isCentralAtom ) {
      this.velocityProperty.value = this.velocityProperty.value.plus( velocityChange );
    }
  }

  /**
   * Steps this pair group forward in time (moving in the direction of its velocity), and slowly damps the velocity.
   * @public
   *
   * @param {number} timeElapsed
   */
  stepForward( timeElapsed ) {
    if ( this.userControlledProperty.value ) { return; }

    // velocity changes so that it doesn't point at all towards or away from the origin
    const velocityMagnitudeOutwards = this.velocityProperty.value.dot( this.orientation );
    if ( this.positionProperty.value.magnitude > 0 ) {
      this.velocityProperty.value = this.velocityProperty.value.minus( this.orientation.times( velocityMagnitudeOutwards ) ); // subtract the outwards-component out
    }

    // move position forward by scaled velocity
    this.positionProperty.value = this.positionProperty.value.plus( this.velocityProperty.value.times( timeElapsed ) );

    // add in damping so we don't get the kind of oscillation that we are seeing
    let damping = 1 - PairGroup.DAMPING_FACTOR;
    damping = Math.pow( damping, timeElapsed / 0.017 ); // based so that we have no modification at 0.017
    this.velocityProperty.value = this.velocityProperty.value.times( damping );
  }

  /**
   * Sets the position and zeros the velocity.
   * @public
   *
   * @param {Vector3} vector
   */
  dragToPosition( vector ) {
    this.positionProperty.value = vector;

    // stop any velocity that was moving the pair
    this.velocityProperty.value = new Vector3( 0, 0, 0 );
  }

  /**
   * @public
   *
   * @param {PairGroup} centralAtom
   * @returns {Object}
   */
  toStateObject( centralAtom ) {
    return {
      position: this.positionProperty.value.toStateObject(),
      velocity: this.velocityProperty.value.toStateObject(),
      isLonePair: this.isLonePair,
      element: this.element === null ? null : this.element.symbol,
      isCentralAtom: this === centralAtom
    };
  }

  /**
   * @public
   *
   * @param {Object} obj
   * @returns {PairGroup}
   */
  static fromStateObject( obj ) {
    const position = Vector3.fromStateObject( obj.position );
    const velocity = Vector3.fromStateObject( obj.velocity );
    const isLonePair = obj.isLonePair;
    const element = obj.element === null ? null : Element.getElementBySymbol( obj.element );

    const pairGroup = new PairGroup( position, isLonePair, {
      element: element
    } );
    pairGroup.isCentralAtom = obj.isCentralAtom;
    pairGroup.velocityProperty.value = velocity;
    return pairGroup;
  }

  /**
   * Returns a multiplicative factor based on the time elapsed, so that we can avoid oscillation when the frame-rate is
   * low, due to how the damping is implemented.
   * @public
   *
   * @param {number} timeElapsed
   * @returns {number}
   */
  static getTimescaleImpulseFactor( timeElapsed ) {
    return Math.sqrt( ( timeElapsed > 0.017 ) ? 0.017 / timeElapsed : 1 );
  }
}

moleculeShapes.register( 'PairGroup', PairGroup );

/*---------------------------------------------------------------------------*
 * constants
 *----------------------------------------------------------------------------*/

// @public {number} - Ideal distance from atom to atom (model screen).
PairGroup.BONDED_PAIR_DISTANCE = 10.0;

// @public {number} - Ideal distance from atom to lone pair (both screens).
PairGroup.LONE_PAIR_DISTANCE = 7.0;

// @public {number} - Control on Coulomb effect. Tuned for stability and aesthetic.
PairGroup.ELECTRON_PAIR_REPULSION_SCALE = 30000;

// @public {number} - Tuned control of fake force to push angles between pair groups to their ideal.
PairGroup.ANGLE_REPULSION_SCALE = 3;

// @public {number} - Tuned control for force to jitter positions of atoms (planar cases otherwise stable)
PairGroup.JITTER_SCALE = 0.001;

// @public {number} - Tuned control to reduce velocity, in order to ensure stability.
PairGroup.DAMPING_FACTOR = 0.1;

function interpolate( a, b, ratio ) {
  return a * ( 1 - ratio ) + b * ratio;
}

// @public {IOType}
PairGroup.PairGroupIO = new IOType( 'PairGroupIO', {
  valueType: PairGroup,
  stateSchema: {
    position: Vector3.Vector3IO,
    velocity: Vector3.Vector3IO,
    isLonePair: BooleanIO,
    element: NullableIO( StringIO ),
    isCentralAtom: BooleanIO
  }
} );

export default PairGroup;
