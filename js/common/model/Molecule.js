// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model of a single-atom-centered molecule which has a certain number of pair groups
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
  var VseprConfiguration = require( 'MOLECULE_SHAPES/common/model/VseprConfiguration' );
  var LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );

  var MAX_PAIRS = 6;

  /*
   * @constructor
   */
  function Molecule() {
    Events.call( this );

    var molecule = this;

    // @public - all of the pair groups
    this.groups = [];

    // @public - bonds between pair groups. for lone pairs, this doesn't mean an actual molecular bond, so we just have order 0
    this.bonds = [];

    // @public - cached subsets of groups (changed on modifications) that we need to iterate through without GC
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
    // abstract getLocalShape( atom )
    // abstract getMaximumBondLength() -- option
    // abstract isReal()

    update: function( tpf ) {
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

        group.stepForward( tpf );
        group.attractToIdealDistance( tpf, oldDistance, parentBond );
      }
    },

    // the number of surrounding pair groups
    getStericNumber: function( group ) {
      return this.getBondsAround( group ).length;
    },

    getBondsAround: function( group ) {
      // all bonds to the pair group, if specified
      return _.filter( this.bonds, function( bond ) { return bond.contains( group ); } );
    },

    // all neighboring pair groups
    getNeighbors: function( group ) {
      return _.map( this.getBondsAround( group ), function( bond ) { return bond.getOtherAtom( group ); } );
    },

    getCentralVseprConfiguration: function() {
      return VseprConfiguration.getConfiguration( this.radialAtoms.length, this.radialLonePairs.length );
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

      this.groups.push( group );
      if ( group.isLonePair ) {
        this.lonePairs.push( group );
      } else {
        this.atoms.push( group );
      }

      // notify
      if ( notify ) {
        this.trigger1( 'groupAdded', group );
      }
    },

    addBond: function( bond ) {
      this.bonds.push( bond );

      if ( bond.contains( this.centralAtom ) ) {
        var group = bond.getOtherAtom( this.centralAtom );
        this.radialGroups.push( group );
        if ( group.isLonePair ) {
          this.radialLonePairs.push( group );
        } else {
          this.radialAtoms.push( group );
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
      return this.getCentralVseprConfiguration().geometry.unitVectors;
    },

    /**
     * @param bondOrder Bond order of potential pair group to add
     * @return Whether the pair group can be added, or whether this molecule would go over its pair limit
     */
    wouldAllowBondOrder: function( bondOrder ) {
      return this.getStericNumber( this.centralAtom ) < MAX_PAIRS;
    },

    getDistantLonePairs: function() {
      var closeLonePairs = this.radialLonePairs;
      return _.filter( this.lonePairs, function( lonePair ) { return !_.contains( closeLonePairs, lonePair ); } );
    },

    getLocalVSEPRShape: function( atom ) {
      var groups = LocalShape.sortedLonePairsFirst( this.getNeighbors( atom ) );
      // TODO: optimized function for counting?
      var numLonePairs = _.filter( groups, function( group ) { return group.isLonePair; } ).length;
      var numAtoms = groups.length - numLonePairs;
      return new LocalShape( LocalShape.vseprPermutations( groups ), atom, groups, ( VseprConfiguration.getConfiguration( numAtoms, numLonePairs ) ).geometry.unitVectors );
    },

    getIdealDistanceFromCenter: function( group ) {
      // this only works on pair groups adjacent to the central atom
      var bond = this.getParentBond( group );
      assert && assert( bond.contains( this.centralAtom ) );

      return group.isLonePair ? PairGroup.LONE_PAIR_DISTANCE : bond.length;
    },

    addTerminalLonePairs: function( atom, quantity ) {
      var pairConfig = VseprConfiguration.getConfiguration( 1, quantity );
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
