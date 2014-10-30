// Copyright 2002-2014, University of Colorado Boulder

/**
 * Base type of model of a single-atom-centered molecule which has a certain number of pair groups
 * surrounding it.
 *
 * Events:
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
    } else {
      array.push( item );
    }
  }

  /*
   * @constructor
   */
  function Molecule() {
    Events.call( this );

    var molecule = this;

    // @public - all of the pair groups, with lone pairs first
    this.groups = [];

    // @public - bonds between pair groups. for lone pairs, this doesn't mean an actual molecular bond,
    // so we just have order 0. Lone-pair 'bonds' are listed first.
    this.bonds = [];

    // @public - cached subsets of groups (changed on modifications) that we need to iterate through without GC
    // with lone pairs first
    this.atoms = []; // !isLonePair
    this.lonePairs = []; // isLonePair
    this.radialGroups = []; // bonded with centralAtom
    this.radialAtoms = []; // !isLonePair, bonded with centralAtom
    this.radialLonePairs = []; // isLonePair, bonded with centralAtom

    // @public
    this.centralAtom = null; // will be filled in later

    // composite events
    this.on( 'bondAdded', function( bond ) { molecule.trigger1( 'bondChanged', bond ); } );
    this.on( 'bondRemoved', function( bond ) { molecule.trigger1( 'bondChanged', bond ); } );
    this.on( 'groupAdded', function( group ) { molecule.trigger1( 'groupChanged', group ); } );
    this.on( 'groupRemoved', function( group ) { molecule.trigger1( 'groupChanged', group ); } );
  }

  return inherit( Events, Molecule, {
    // abstract {LocalShape} getLocalShape( atom )
    // abstract {number | undefined} getMaximumBondLength()
    // abstract {boolean} isReal

    update: function( dt ) {
      var numGroups = this.groups.length;
      for ( var i = 0; i < numGroups; i++ ) {
        var group = this.groups[i];

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

    getBondsAround: function( group ) {
      // all bonds to the pair group, if specified
      return _.filter( this.bonds, function( bond ) { return bond.contains( group ); } );
    },

    // all neighboring pair groups
    getNeighbors: function( group ) {
      return _.map( this.getBondsAround( group ), function( bond ) { return bond.getOtherAtom( group ); } );
    },

    // like getNeighbors( group ).length, but more efficient
    getNeighborCount: function( group ) {
      var count = 0;
      for ( var i = 0; i < this.bonds.length; i++ ) {
        if ( this.bonds[i].contains( group ) ) {
          count++;
        }
      }
      return count;
    },

    getCentralVSEPRConfiguration: function() {
      return VSEPRConfiguration.getConfiguration( this.radialAtoms.length, this.radialLonePairs.length );
    },

    // get the bond to the more central "parent", or undefined
    getParentBond: function( group ) {
      // assumes we have simple atoms (star-shaped) with terminal lone pairs
      if ( group.isLonePair ) {
        return this.getBondsAround( group )[0];
      }
      else {
        var centralAtom = this.centralAtom;
        var result = _.filter( this.getBondsAround( group ), function( bond ) { return bond.getOtherAtom( group ) === centralAtom; } )[0];
        return result || null;
      }
    },

    // get the more central "parent" group
    getParent: function( group ) {
      return this.getParentBond( group ).getOtherAtom( group );
    },

    // add in the central atom
    addCentralAtom: function( group ) {
      this.centralAtom = group;
      this.addGroup( group, true );
    },

    addGroupAndBond: function( group, parent, bondOrder, bondLength ) {
      // add the group, but delay notifications (inconsistent state)
      this.addGroup( group, false );

      bondLength = bondLength || group.position.minus( parent.position ).magnitude();

      // add the bond after the group so we can reference things properly
      this.addBond( new Bond( group, parent, bondOrder, bondLength ) );

      // notify after bond added, so we don't send notifications in an inconsistent state
      this.trigger1( 'groupAdded', group );
    },

    addGroup: function( group, notify ) {
      // always add the central group first
      assert && assert( this.centralAtom !== null );

      addToEndOfArray( this.groups, group, group.isLonePair );
      if ( group.isLonePair ) {
        addToEndOfArray( this.lonePairs, group, group.isLonePair );
      } else {
        addToEndOfArray( this.atoms, group, group.isLonePair );
      }

      // notify
      if ( notify ) {
        this.trigger1( 'groupAdded', group );
      }
    },

    addBond: function( bond ) {
      var isLonePairBond = bond.order === 0;

      addToEndOfArray( this.bonds, bond, isLonePairBond );

      if ( bond.contains( this.centralAtom ) ) {
        var group = bond.getOtherAtom( this.centralAtom );
        addToEndOfArray( this.radialGroups, group, isLonePairBond );
        if ( group.isLonePair ) {
          addToEndOfArray( this.radialLonePairs, group, isLonePairBond );
        } else {
          addToEndOfArray( this.radialAtoms, group, isLonePairBond );
        }
      }

      this.trigger1( 'bondAdded', bond );
    },

    removeBond: function( bond ) {
      arrayRemove( this.bonds, bond );

      if ( bond.contains( this.centralAtom ) ) {
        var group = bond.getOtherAtom( this.centralAtom );
        arrayRemove( this.radialGroups, group );
        if ( group.isLonePair ) {
          arrayRemove( this.radialLonePairs, group );
        } else {
          arrayRemove( this.radialAtoms, group );
        }
      }

      this.trigger1( 'bondRemoved', bond );
    },

    removeGroup: function( group ) {
      var i;

      assert && assert( this.centralAtom !== group );

      // remove all of its bonds first
      var bondList = this.getBondsAround( group );
      for ( i = 0; i < bondList.length; i++ ) {
        this.removeBond( bondList[i] );
      }

      arrayRemove( this.groups, group );
      if ( group.isLonePair ) {
        arrayRemove( this.lonePairs, group );
      } else {
        arrayRemove( this.atoms, group );
      }

      // notify
      this.trigger1( 'groupRemoved', group );
      for ( i = 0; i < bondList.length; i++ ) {
        // delayed notification for bond removal
        this.trigger1( 'bondRemoved', bondList[i] );
      }
    },

    removeAllGroups: function() {
      var groupsCopy = this.groups.slice();
      for ( var i = 0; i < groupsCopy.length; i++ ) {
        if ( groupsCopy[i] !== this.centralAtom ) {
          this.removeGroup( groupsCopy[i] );
        }
      }
    },

    getGroups: function() {
      return this.groups;
    },

    getCorrespondingIdealGeometryVectors: function() {
      return this.getCentralVSEPRConfiguration().geometry.unitVectors;
    },

    /**
     * @param bondOrder Bond order of potential pair group to add
     * @return Whether the pair group can be added, or whether this molecule would go over its pair limit
     */
    wouldAllowBondOrder: function( bondOrder ) {
      return this.radialGroups.length < MAX_PAIRS;
    },

    getDistantLonePairs: function() {
      var closeLonePairs = this.radialLonePairs;
      return _.filter( this.lonePairs, function( lonePair ) { return !_.contains( closeLonePairs, lonePair ); } );
    },

    getLocalVSEPRShape: function( atom ) {
      var groups = this.getNeighbors( atom );

      // count lone pairs
      var numLonePairs = 0;
      for ( var i = 0; i < groups.length; i++ ) {
        if ( groups[i].isLonePair ) {
          numLonePairs++;
        }
      }

      var numAtoms = groups.length - numLonePairs;
      return new LocalShape( LocalShape.vseprPermutations( groups ), atom, groups, ( VSEPRConfiguration.getConfiguration( numAtoms, numLonePairs ) ).geometry.unitVectors );
    },

    getIdealDistanceFromCenter: function( group ) {
      // this only works on pair groups adjacent to the central atom
      var bond = this.getParentBond( group );
      assert && assert( bond.contains( this.centralAtom ) );

      return group.isLonePair ? PairGroup.LONE_PAIR_DISTANCE : bond.length;
    },

    addTerminalLonePairs: function( atom, quantity ) {
      var pairConfig = VSEPRConfiguration.getConfiguration( 1, quantity );
      var lonePairOrientations = pairConfig.geometry.unitVectors;

      // we want to rotate the ideal configuration of lone pairs to the atom's orientation
      var matrix = Matrix3.rotateAToB( lonePairOrientations[lonePairOrientations.length - 1].negated(), atom.orientation );

      for ( var i = 0; i < quantity; i++ ) {
        // mapped into our coordinates
        var lonePairOrientation = matrix.timesVector3( lonePairOrientations[i] );
        this.addGroupAndBond( new PairGroup( atom.position.plus( lonePairOrientation.times( PairGroup.LONE_PAIR_DISTANCE ) ), true ), atom, 0 );
      }
    }
  } );
} );
