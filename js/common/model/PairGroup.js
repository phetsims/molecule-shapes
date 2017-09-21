// Copyright 2013-2017, University of Colorado Boulder

/**
 * A pair of electrons in VSEPR, which are either an atom (the electrons are constrained by the bond) or a lone pair.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var Property = require( 'AXON/Property' );
  var Vector3 = require( 'DOT/Vector3' );

  var nextId = 0;

  /**
   * @constructor
   * @param {Vector3} position - Initial position
   * @param {boolean} isLonePair - True for a lone pair, false for an atom
   * @param {Object} [options] - See in the constructor for more information
   */
  function PairGroup( position, isLonePair, options ) {
    options = _.extend( {
      // {Element | null} - The NITROGLYCERIN element if applicable (e.g. real model), or null if there is no element.
      element: null
    }, options );

    var self = this;

    // @public {number - Unique identifier.
    this.id = nextId++;

    this.positionProperty = new Property( position ); // @public {Vector3}
    this.velocityProperty = new Property( Vector3.ZERO ); // @public {Vector3}
    this.userControlledProperty = new Property( false ); // @public {boolean} - Whether the user is directly manipulating the position currently.

    this.orientation = new Vector3(); // @public (read-only) {Vector3} - Normalized position (unit vector).
    this.positionProperty.link( function( position ) {
      self.orientation.set( position );

      if ( position.magnitude() > 0 ) {
        self.orientation.normalize();
      }
    } );

    this.isLonePair = isLonePair; // @public {boolean}
    this.isCentralAtom = false; // @public {boolean - Might be overridden to true by Molecule.addCentralAtom().

    this.element = options.element; // @public {Element | undefined} - undefined for VSEPR pair group

    if ( assert ) {
      this.positionProperty.lazyLink( function( newValue, oldValue ) {
        assert && assert( !isNaN( newValue.x ), 'NaN detected in position!' );
      } );
      this.velocityProperty.lazyLink( function( newValue, oldValue ) {
        assert && assert( !isNaN( newValue.x ), 'NaN detected in velocity!' );
      } );
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

  // @public {number} - Tuned control for force to jitter locations of atoms (planar cases otherwise stable)
  PairGroup.JITTER_SCALE = 0.001;

  // @public {number} - Tuned control to reduce velocity, in order to ensure stability.
  PairGroup.DAMPING_FACTOR = 0.1;

  function interpolate( a, b, ratio ) {
    return a * ( 1 - ratio ) + b * ratio;
  }

  /**
   * Returns a multiplicative factor based on the time elapsed, so that we can avoid oscillation when the frame-rate is
   * low, due to how the damping is implemented.
   * @public
   *
   * @param {number} timeElapsed
   * @returns {number}
   */
  PairGroup.getTimescaleImpulseFactor = function( timeElapsed ) {
    return Math.sqrt( ( timeElapsed > 0.017 ) ? 0.017 / timeElapsed : 1 );
  };

  return inherit( Object, PairGroup, {

    /**
     * Applies a damped spring-like system to move this pair group towards the "ideal" distance from its parent atom.
     * @public
     *
     * @param {number} timeElapsed - Amount of time the attraction is to be applied over
     * @param {number} oldDistance - Previous distance from the pair group to its parent atom
     * @param {Bond} bond - Bond to the parent atom
     */
    attractToIdealDistance: function( timeElapsed, oldDistance, bond ) {
      if ( this.userControlledProperty.get() ) {
        // don't process if being dragged
        return;
      }
      var origin = bond.getOtherAtom( this ).positionProperty.get();

      var isTerminalLonePair = !origin.equals( Vector3.ZERO );

      var idealDistanceFromCenter = bond.length;

      /*---------------------------------------------------------------------------*
       * prevent movement away from our ideal distance
       *----------------------------------------------------------------------------*/
      var currentError = Math.abs( ( this.positionProperty.get().minus( origin ) ).magnitude() - idealDistanceFromCenter );
      var oldError = Math.abs( oldDistance - idealDistanceFromCenter );
      if ( currentError > oldError ) {
        // our error is getting worse! for now, don't let us slide AWAY from the ideal distance ever
        // set our distance to the old one, so it is easier to process
        this.positionProperty.set( this.orientation.times( oldDistance ).plus( origin ) );
      }

      /*---------------------------------------------------------------------------*
       * use damped movement towards our ideal distance
       *----------------------------------------------------------------------------*/
      var toCenter = this.positionProperty.get().minus( origin );

      var distance = toCenter.magnitude();
      if ( distance !== 0 ) {
        var directionToCenter = toCenter.normalized();

        var offset = idealDistanceFromCenter - distance;

        // just modify position for now so we don't get any oscillations
        var ratioOfMovement = Math.pow( 0.1, 0.016 / timeElapsed ); // scale this exponentially by how much time has elapsed, so the more time taken, the faster we move towards the ideal distance
        if ( isTerminalLonePair ) {
          ratioOfMovement = 1;
        }
        this.positionProperty.set( this.positionProperty.get().plus( directionToCenter.times( ratioOfMovement * offset ) ) );
      }
    },

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
    getRepulsionImpulse: function( other, timeElapsed, trueLengthsRatioOverride ) {
      // only handle the force on this object for now

      // If the positions overlap, just let the attraction take care of things. See https://github.com/phetsims/molecule-shapes/issues/136
      if ( this.positionProperty.get().equalsEpsilon( other.positionProperty.get(), 1e-6 ) ) {
        return new Vector3();
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
      var adjustedMagnitude = interpolate( PairGroup.BONDED_PAIR_DISTANCE, this.positionProperty.get().magnitude(), trueLengthsRatioOverride );
      var adjustedOtherMagnitude = interpolate( PairGroup.BONDED_PAIR_DISTANCE, other.positionProperty.get().magnitude(), trueLengthsRatioOverride );

      // adjusted positions
      var adjustedPosition = this.orientation.times( adjustedMagnitude );
      var adjustedOtherPosition = other.positionProperty.get().magnitude() === 0 ? new Vector3() : other.orientation.times( adjustedOtherMagnitude );

      // from other => this (adjusted)
      var delta = adjustedPosition.minus( adjustedOtherPosition );

      /*---------------------------------------------------------------------------*
       * coulomb repulsion
       *----------------------------------------------------------------------------*/

      // mimic Coulomb's Law
      var coulombVelocityDelta = delta.withMagnitude( timeElapsed * PairGroup.ELECTRON_PAIR_REPULSION_SCALE / ( delta.magnitude() * delta.magnitude() ) );

      // apply a nonphysical reduction on coulomb's law when the frame-rate is low, so we can avoid oscillation
      var coulombDowngrade = PairGroup.getTimescaleImpulseFactor( timeElapsed );
      return coulombVelocityDelta.times( coulombDowngrade );
    },

    /**
     * Applies a repulsive force from another PairGroup to this PairGroup.
     * @public
     *
     * @param {PairGroup} other - The pair group whose force on this object we want
     * @param {number} timeElapsed - Time elapsed (thus we return an impulse instead of a force)
     * @param {number} trueLengthsRatioOverride - From 0 to 1. If 0, lone pairs will behave the same as bonds. If 1, lone pair
     *                                            distance will be taken into account
     */
    repulseFrom: function( other, timeElapsed, trueLengthsRatioOverride ) {
      this.addVelocity( this.getRepulsionImpulse( other, timeElapsed, trueLengthsRatioOverride ) );
    },

    /**
     * Adds a change to our position if this PairGroup can have non-user-controlled changes.
     * @public
     *
     * @param {Vector3} positionChange
     */
    addPosition: function( positionChange ) {
      // don't allow velocity changes if we are dragging it, OR if it is an atom at the origin
      if ( !this.userControlledProperty.get() && !this.isCentralAtom ) {
        this.positionProperty.value = this.positionProperty.get().plus( positionChange );
      }
    },

    /**
     * Adds a change to our velocity if this PairGroup can have non-user-controlled changes.
     * @public
     *
     * @param {Vector3} velocityChange
     */
    addVelocity: function( velocityChange ) {
      // don't allow velocity changes if we are dragging it, OR if it is an atom at the origin
      if ( !this.userControlledProperty.get() && !this.isCentralAtom ) {
        this.velocityProperty.value = this.velocityProperty.get().plus( velocityChange );
      }
    },

    /**
     * Steps this pair group forward in time (moving in the direction of its velocity), and slowly damps the velocity.
     * @public
     *
     * @param {number} timeElapsed
     */
    stepForward: function( timeElapsed ) {
      if ( this.userControlledProperty.get() ) { return; }

      // velocity changes so that it doesn't point at all towards or away from the origin
      var velocityMagnitudeOutwards = this.velocityProperty.get().dot( this.orientation );
      if ( this.positionProperty.get().magnitude() > 0 ) {
        this.velocityProperty.value = this.velocityProperty.get().minus( this.orientation.times( velocityMagnitudeOutwards ) ); // subtract the outwards-component out
      }

      // move position forward by scaled velocity
      this.positionProperty.value = this.positionProperty.get().plus( this.velocityProperty.get().times( timeElapsed ) );

      // add in damping so we don't get the kind of oscillation that we are seeing
      var damping = 1 - PairGroup.DAMPING_FACTOR;
      damping = Math.pow( damping, timeElapsed / 0.017 ); // based so that we have no modification at 0.017
      this.velocityProperty.value = this.velocityProperty.get().times( damping );
    },

    /**
     * Sets the position and zeros the velocity.
     * @public
     *
     * @param {Vector3} vector
     */
    dragToPosition: function( vector ) {
      this.positionProperty.set( vector );

      // stop any velocity that was moving the pair
      this.velocityProperty.set( new Vector3() );
    }
  } );
} );
