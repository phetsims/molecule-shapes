// Copyright 2013-2015, University of Colorado Boulder

/**
 * Base type of model of a single-atom-centered molecule which has a certain number of pair groups
 * surrounding it. Concrete sub-types should implement the methods documented at the start of the prototype.
 *
 * Molecule extends Events, so the following events can be triggered/listened to directly:
 *  bondAdded( bond )
 *  bondRemoved( bond )
 *  bondChanged( bond )
 *  groupAdded( group )
 *  groupRemoved( group )
 *  groupChanged( group )
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var arrayRemove = require( 'PHET_CORE/arrayRemove' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Events = require( 'AXON/Events' );
  var Bond = require( 'MOLECULE_SHAPES/common/model/Bond' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var VSEPRConfiguration = require( 'MOLECULE_SHAPES/common/model/VSEPRConfiguration' );
  var LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );

  var MAX_PAIRS = 6;

  function addToEndOfArray( array, item, addToFront ) {
    if ( addToFront ) {
      array.unshift( item );
    }
    else {
      array.push( item );
    }
  }

  /*
   * @constructor
   * @param {boolean} isReal - Whether the molecule has real angles, or is based on a model.
   */
  function Molecule( isReal ) {
    Events.call( this );

    this.isReal = isReal; // @public {boolean} - Whether this molecule is based on real angles or on a model.

    var self = this;

    // @public {Array.<PairGroup>} - all of the pair groups, with lone pairs first
    this.groups = [];

    // @public {Array.<Bond>} - bonds between pair groups. for lone pairs, this doesn't mean an actual molecular bond,
    // so we just have order 0. Lone-pair 'bonds' are listed first.
    this.bonds = [];

    // Cched subsets of groups (changed on modifications) that we need to iterate through without GC
    // with lone pairs first
    this.atoms = []; // @public {Array.<PairGroup>} - !isLonePair
    this.lonePairs = []; // @public {Array.<PairGroup>} - isLonePair
    this.radialGroups = []; // @public {Array.<PairGroup>} - bonded with centralAtom
    this.radialAtoms = []; // @public {Array.<PairGroup>} - !isLonePair, bonded with centralAtom
    this.radialLonePairs = []; // @public {Array.<PairGroup>} - isLonePair, bonded with centralAtom

    this.centralAtom = null; // @public {PairGroup} - Will be filled in later.

    // composite events
    this.on( 'bondAdded', function( bond ) { self.trigger1( 'bondChanged', bond ); } );
    this.on( 'bondRemoved', function( bond ) { self.trigger1( 'bondChanged', bond ); } );
    this.on( 'groupAdded', function( group ) { self.trigger1( 'groupChanged', group ); } );
    this.on( 'groupRemoved', function( group ) { self.trigger1( 'groupChanged', group ); } );
  }

  moleculeShapes.register( 'Molecule', Molecule );

  return inherit( Events, Molecule, {
    /**
     * Gets the ideal orientations for the bonds around an atom.
     * @public
     * @abstract
     *
     * @param {PairGroup} atom
     * @returns {LocalShape}
     */
    getLocalShape: function( atom ) {
      throw new Error( 'abstract method' );
    },

    /**
     * @public
     * @abstract
     * @returns {number | undefined} if applicable
     */
    getMaximumBondLength: function() {
      throw new Error( 'abstract method' );
    },

    // @abstract {boolean} - Whether the Molecule is considered 'real', or is just a 'model'.
    isReal: false,

    /**
     * Step function for the physics
     * @public
     *
     * @param {number} dt
     */
    update: function( dt ) {
      var numGroups = this.groups.length;
      for ( var i = 0; i < numGroups; i++ ) {
        var group = this.groups[ i ];

        // ignore processing on the central atom
        if ( group === this.centralAtom ) {
          continue;
        }

        var parentBond = this.getParentBond( group );
        var parentGroup = parentBond.getOtherAtom( group );

        // store the old distance before stepping in time
        var oldDistance = group.position.distance( parentGroup.position );

        group.stepForward( dt );
        group.attractToIdealDistance( dt, oldDistance, parentBond );
      }
    },

    /**
     * Given a pair group, return an array of all bonds connected to that pair group.
     * @public
     *
     * @param {PairGroup} group
     * @returns {Array.<Bond.<PairGroup>>}
     */
    getBondsAround: function( group ) {
      // all bonds to the pair group, if specified
      return _.filter( this.bonds, function( bond ) { return bond.contains( group ); } );
    },

    /**
     * Given a pair group, return an array of all pair groups connected to it by a bond.
     * @public
     *
     * @param {PairGroup} group
     * @returns {Array.<PairGroup>}
     */
    getNeighbors: function( group ) {
      return _.map( this.getBondsAround( group ), function( bond ) { return bond.getOtherAtom( group ); } );
    },

    /**
     * Return the number of neighbors returned by getNeighbors(), but more efficiently.
     * @public
     *
     * @param {PairGroup} group
     * @returns {number}
     */
    getNeighborCount: function( group ) {
      var count = 0;
      for ( var i = 0; i < this.bonds.length; i++ ) {
        if ( this.bonds[ i ].contains( group ) ) {
          count++;
        }
      }
      return count;
    },

    /**
     * Configuration for the center of the molecule.
     * @public
     *
     * @returns {VSEPRConfiguration}
     */
    getCentralVSEPRConfiguration: function() {
      return VSEPRConfiguration.getConfiguration( this.radialAtoms.length, this.radialLonePairs.length );
    },

    /**
     * Given a pair group, return the bond (if it exists) from it to the central atom (or an atom bonded to the central
     * atom), OR null.
     * @public
     *
     * @param {PairGroup} group
     * @returns {Bond.<PairGroup> | null}
     */
    getParentBond: function( group ) {
      // assumes we have simple atoms (star-shaped) with terminal lone pairs
      if ( group.isLonePair ) {
        return this.getBondsAround( group )[ 0 ];
      }
      else {
        var centralAtom = this.centralAtom;
        var result = _.filter( this.getBondsAround( group ), function( bond ) { return bond.getOtherAtom( group ) === centralAtom; } )[ 0 ];
        return result || null;
      }
    },

    /**
     * Given a pair group, return the pair group closer to the center of the molecule,
     * equivalent to getParentBond( x ).getOtherAtom( x );
     * @public
     *
     * @param {PairGroup} group
     * @returns {PairGroup}
     */
    getParent: function( group ) {
      return this.getParentBond( group ).getOtherAtom( group );
    },

    /**
     * Adds in the central atom.
     * @public
     *
     * @param {PairGroup} group
     */
    addCentralAtom: function( group ) {
      this.centralAtom = group;
      this.addGroup( group, true );
      group.isCentralAtom = true;
    },

    /**
     * Adds a "child" pair group to the molecule, along with a bond between it and a parent pair group.
     * @public
     *
     * @param {PairGroup} group
     * @param {PairGroup} parent
     * @param {number} bondOrder - 0 for lone pairs.
     * @param {number} bondLength - Length of the bond.
     */
    addGroupAndBond: function( group, parent, bondOrder, bondLength ) {
      // add the group, but delay notifications (inconsistent state)
      this.addGroup( group, false );

      bondLength = bondLength || group.position.minus( parent.position ).magnitude();

      // add the bond after the group so we can reference things properly
      this.addBond( new Bond( group, parent, bondOrder, bondLength ) );

      // notify after bond added, so we don't send notifications in an inconsistent state
      this.trigger1( 'groupAdded', group );
    },

    /**
     * Adds a pair group to the molecule, with an option of whether to modify or not.
     * @public
     *
     * @param {PairGroup} group
     * @param {boolean} notify - Whether notifications should be sent out for the corresponding event.
     */
    addGroup: function( group, notify ) {
      // always add the central group first
      assert && assert( this.centralAtom !== null );

      addToEndOfArray( this.groups, group, group.isLonePair );
      if ( group.isLonePair ) {
        addToEndOfArray( this.lonePairs, group, group.isLonePair );
      }
      else {
        addToEndOfArray( this.atoms, group, group.isLonePair );
      }

      // notify
      if ( notify ) {
        this.trigger1( 'groupAdded', group );
      }
    },

    /**
     * Adds a bond to the molecule.
     * @public
     *
     * @param {Bond.<PairGroup>}
     */
    addBond: function( bond ) {
      var isLonePairBond = bond.order === 0;

      addToEndOfArray( this.bonds, bond, isLonePairBond );

      if ( bond.contains( this.centralAtom ) ) {
        var group = bond.getOtherAtom( this.centralAtom );
        addToEndOfArray( this.radialGroups, group, isLonePairBond );
        if ( group.isLonePair ) {
          addToEndOfArray( this.radialLonePairs, group, isLonePairBond );
        }
        else {
          addToEndOfArray( this.radialAtoms, group, isLonePairBond );
        }
      }

      this.trigger1( 'bondAdded', bond );
    },

    /**
     * Removes a bond to the molecule.
     * @public
     *
     * @param {Bond.<PairGroup>}
     */
    removeBond: function( bond ) {
      arrayRemove( this.bonds, bond );

      if ( bond.contains( this.centralAtom ) ) {
        var group = bond.getOtherAtom( this.centralAtom );
        arrayRemove( this.radialGroups, group );
        if ( group.isLonePair ) {
          arrayRemove( this.radialLonePairs, group );
        }
        else {
          arrayRemove( this.radialAtoms, group );
        }
      }

      this.trigger1( 'bondRemoved', bond );
    },

    /**
     * Removes a pair group from the molecule (and any attached bonds)
     * @public
     *
     * @param {PairGroup}
     */
    removeGroup: function( group ) {
      var i;

      assert && assert( this.centralAtom !== group );

      // remove all of its bonds first
      var bondList = this.getBondsAround( group );
      for ( i = 0; i < bondList.length; i++ ) {
        this.removeBond( bondList[ i ] );
      }

      arrayRemove( this.groups, group );
      if ( group.isLonePair ) {
        arrayRemove( this.lonePairs, group );
      }
      else {
        arrayRemove( this.atoms, group );
      }

      // notify
      this.trigger1( 'groupRemoved', group );
      for ( i = 0; i < bondList.length; i++ ) {
        // delayed notification for bond removal
        this.trigger1( 'bondRemoved', bondList[ i ] );
      }
    },

    /**
     * Removes all pair groups (and thus bonds) from the molecule.
     * @public
     */
    removeAllGroups: function() {
      var groupsCopy = this.groups.slice();
      for ( var i = 0; i < groupsCopy.length; i++ ) {
        if ( groupsCopy[ i ] !== this.centralAtom ) {
          this.removeGroup( groupsCopy[ i ] );
        }
      }
    },

    /**
     * Returns an array of unit vectors (orientations) corresponding to the ideal geometry for the shape of our
     * central atom.
     * @public
     *
     * returns {Array.<Vector3>}
     */
    getCorrespondingIdealGeometryVectors: function() {
      return this.getCentralVSEPRConfiguration().geometry.unitVectors;
    },

    /**
     * Whether a pair group of the specified bond order can be added, or whether this molecule would go over its pair
     * limit.
     * @public
     *
     * @param {number> bondOrder - Bond order of potential pair group to add (0 for lone pair)
     * @returns {boolean}
     */
    wouldAllowBondOrder: function( bondOrder ) {
      return this.radialGroups.length < MAX_PAIRS;
    },

    /**
     * Returns an array of all lone pairs that are not directly connected to our central atom.
     * @public
     *
     * @param {Array.<PairGroup>}
     */
    getDistantLonePairs: function() {
      var closeLonePairs = this.radialLonePairs;
      return _.filter( this.lonePairs, function( lonePair ) { return !_.contains( closeLonePairs, lonePair ); } );
    },

    /**
     * Returns a LocalShape object that represents the ideal shape (layout) of bonds around a specific atom, and that
     * can be used to apply attraction/repulsion forces to converge to that shape.
     * @public
     *
     * @param {PairGroup} atom
     * @returns {LocalShape}
     */
    getLocalVSEPRShape: function( atom ) {
      var groups = this.getNeighbors( atom );

      // count lone pairs
      var numLonePairs = 0;
      for ( var i = 0; i < groups.length; i++ ) {
        if ( groups[ i ].isLonePair ) {
          numLonePairs++;
        }
      }

      var numAtoms = groups.length - numLonePairs;
      return new LocalShape( LocalShape.vseprPermutations( groups ), atom, groups, ( VSEPRConfiguration.getConfiguration( numAtoms, numLonePairs ) ).geometry.unitVectors );
    },

    /**
     * Given a pair group attached to the central atom, return its ideal distance from the central atom.
     * @public
     *
     * @param {PairGroup} group
     * @returns {number}
     */
    getIdealDistanceFromCenter: function( group ) {
      // this only works on pair groups adjacent to the central atom
      var bond = this.getParentBond( group );
      assert && assert( bond.contains( this.centralAtom ) );

      return group.isLonePair ? PairGroup.LONE_PAIR_DISTANCE : bond.length;
    },

    /**
     * Given an atom attached to the central atom, add a certain quantity of lone pairs (and bonds) around it, in proper
     * initial orientations.
     * @public
     *
     * @param {PairGroup} atom
     * @param {number} quantity
     */
    addTerminalLonePairs: function( atom, quantity ) {
      var pairConfig = VSEPRConfiguration.getConfiguration( 1, quantity );
      var lonePairOrientations = pairConfig.geometry.unitVectors;

      // we want to rotate the ideal configuration of lone pairs to the atom's orientation
      var matrix = Matrix3.rotateAToB( lonePairOrientations[ lonePairOrientations.length - 1 ].negated(), atom.orientation );

      for ( var i = 0; i < quantity; i++ ) {
        // mapped into our coordinates
        var lonePairOrientation = matrix.timesVector3( lonePairOrientations[ i ] );
        this.addGroupAndBond( new PairGroup( atom.position.plus( lonePairOrientation.times( PairGroup.LONE_PAIR_DISTANCE ) ), true ), atom, 0 );
      }
    }
  } );
} );
