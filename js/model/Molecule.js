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
  var Permutation = require( 'DOT/Permutation' );
  var Events = require( 'AXON/Events' );
  var Bond = require( 'MOLECULE_SHAPES/model/Bond' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );
  var GeometryConfiguration = require( 'MOLECULE_SHAPES/model/GeometryConfiguration' );
  var VseprConfiguration = require( 'MOLECULE_SHAPES/model/VseprConfiguration' );
  var LocalShape = require( 'MOLECULE_SHAPES/model/LocalShape' );
  var AttractorModel = require( 'MOLECULE_SHAPES/model/AttractorModel' );

  var MAX_PAIRS = 6;

  function Molecule() {
    // all of the pair groups
    this.groups = [];

    // bonds between pair groups. for lone pairs, this doesn't mean an actual molecular bond, so we just have order 0
    this.bonds = [];

    this.centralAtom = null; // will be filled in later

    // composite events
    this.on( 'bondAdded', function( bond ) { this.trigger1( 'bondChanged', bond ); } );
    this.on( 'bondRemoved', function( bond ) { this.trigger1( 'bondChanged', bond ); } );
    this.on( 'groupAdded', function( group ) { this.trigger1( 'groupChanged', group ); } );
    this.on( 'groupRemoved', function( group ) { this.trigger1( 'groupChanged', group ); } );
  }

  return inherit( Events, Molecule, {
    // abstract getLocalShape( atom )
    // abstract getMaximumBondLength() -- option
    // abstract isReal()

    update: function( tpf ) {
      var that = this;
      // TODO: don't filter for garbage collection. just continue in the for loop
      var nonCentralGroups = _.fiter( this.groups, function( group ) { return group !== that.centralAtom; } );

      // move based on velocity
      for ( var i = 0; i < nonCentralGroups.length; i++ ) {
        var group = nonCentralGroups[i];

        var parentBond = this.getParentBond( group );
        var origin = parentBond.getOtherAtom( group ).position;

        var oldDistance = ( group.position.minus( origin ) ).magnitude();
        group.stepForward( tpf );
        group.attractToIdealDistance( tpf, oldDistance, parentBond );
      }
    },

    getAtoms: function() {
      return _.filter( this.groups, function( group ) { return !group.isLonePair; } );
    },

    // the number of surrounding pair groups
    getStericNumber: function( group ) {
      return this.getBonds( group ).length;
    },

    getBonds: function( group ) {
      if ( group ) {
        // all bonds to the pair group, if specified
        return _.filter( this.bonds, function( bond ) { return bond.contains( group ); } );
      }
      else {
        return this.bonds;
      }
    },

    // all neighboring pair groups
    getNeighbors: function( group ) {
      return _.map( this.getBonds( group ), function( bond ) { return bond.getOtherAtom( group ); } );
    },

    getAllNonCentralAtoms: function() {
      var centralAtom = this.centralAtom;
      return _.filter( this.groups, function( group ) { return !group.isLonePair && group !== centralAtom; } );
    },

    getAllLonePairs: function() {
      return _.filter( this.groups, function( group ) { return group.isLonePair; } );
    },

    // atoms surrounding the center atom
    getRadialAtoms: function() {
      return this.getNeighboringAtoms( this.centralAtom );
    },

    getNeighboringAtoms: function( group ) {
      return _.filter( this.getRadialGroups(), function( group ) { return !group.isLonePair; } );
    },

    getLonePairNeighbors: function( group ) {
      return _.filter( this.getRadialGroups(), function( group ) { return group.isLonePair; } );
    },

    getRadialLonePairs: function() {
      return this.getLonePairNeighbors( this.centralAtom );
    },

    getGeometryConfiguration: function( group ) {
      return GeometryConfiguration.getConfiguration( this.getStericNumber( group ) );
    },

    getCentralVseprConfiguration: function() {
      return this.getVseprConfiguration( this.centralAtom );
    },

    getVseprConfiguration: function( group ) {
      return new VseprConfiguration( this.getNeighboringAtoms( group ).length, this.getLonePairNeighbors( group ).length );
    },

    // get the bond to the more central "parent", or undefined
    getParentBond: function( group ) {
      // assumes we have simple atoms (star-shaped) with terminal lone pairs
      if ( group.isLonePair ) {
        return this.getBonds( group )[0];
      }
      else {
        var centralAtom = this.centralAtom;
        var result = _.filter( this.getBonds( group ), function( bond ) { return bond.getOtherAtom( group ) === centralAtom; } )[0];
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
      this.addGroupOnly( group, true );
    },

    addGroupAndBond: function( group, parent, bondOrder, bondLength ) {
      // add the group, but delay notifications (inconsistent state)
      this.addGroupOnly( group, false );

      bondLength = bondLength || group.position.get().minus( parent.position.get() ).magnitude() / PairGroup.REAL_TMP_SCALE;
      this.addBondBetween( group, parent, bondOrder, bondLength );

      // notify after bond added, so we don't send notifications in an inconsistent state
      this.onGroupAdded.updateListeners( group );
    },

    addGroupOnly: function( group, notify ) {
      // always add the central group first
      assert && assert( this.centralAtom !== null );

      this.groups.push( group );

      // notify
      if ( notify ) {
        this.onGroupAdded.updateListeners( group );
      }
    },

    addBond: function( bond ) {
      this.bonds.push( bond );

      this.onBondAdded.updateListeners( bond );
    },

    addBondBetween: function( a, b, order, bondLength ) {
      this.addBond( new Bond( a, b, order, bondLength ) );
    },

    removeBond: function( bond ) {
      this.bonds.splice( this.bonds.indexOf( bond ), 1 );
      this.onBondRemoved.updateListeners( bond );
    },

    getCentralAtom: function() {
      return this.centralAtom;
    },

    removeGroup: function( group ) {
      var i;

      assert && assert( this.centralAtom !== group );

      // remove all of its bonds first
      var bondList = this.getBonds( group );
      for ( i = 0; i < bondList.length; i++ ) {
        this.bonds.splice( this.bonds.indexOf( bondList[i] ) );
      }

      this.groups.splice( this.groups.indexOf( group ) );

      // notify
      this.onGroupRemoved.updateListeners( group );
      for ( i = 0; i < bondList.length; i++ ) {
        // delayed notification for bond removal
        this.onBondRemoved.updateListeners( bondList[i] );
      }
    },

    removeAllGroups: function() {
      var groupsCopy = this.groups.slice();
      for ( var i = 0; i < groupsCopy; i++ ) {
        if ( groupsCopy[i] !== this.centralAtom ) {
          this.removeGroup( groupsCopy[i] );
        }
      }
    },

    getGroups: function() {
      return this.groups;
    },

    getCorrespondingIdealGeometryVectors: function() {
      return new VseprConfiguration( this.getRadialAtoms().length, this.getRadialLonePairs().length ).geometry.unitVectors;
    },

    /**
     * @param bondOrder Bond order of potential pair group to add
     * @return Whether the pair group can be added, or whether this molecule would go over its pair limit
     */
    wouldAllowBondOrder: function( bondOrder ) {
      return this.getStericNumber( this.centralAtom ) < MAX_PAIRS;
    },

    getDistantLonePairs: function() {
      var closeLonePairs = this.getLonePairNeighbors( this.centralAtom );
      return _.filter( this.getAllLonePairs(), function( lonePair ) { return !closeLonePairs.contains( lonePair ); } );
    },

    getLocalVSEPRShape: function( atom ) {
      var groups = LocalShape.sortedLonePairsFirst( this.getNeighbors( atom ) );
      // TODO: optimized function for counting?
      var numLonePairs = _.filter( groups, function( group ) { return group.isLonePair; } ).length;
      var numAtoms = groups.length - numLonePairs;
      return new LocalShape( LocalShape.vseprPermutations( groups ), atom, groups, ( new VseprConfiguration( numAtoms, numLonePairs ) ).geometry.unitVectors );
    },

    getRadialGroups: function() {
      return this.getNeighbors( this.centralAtom );
    },

    getIdealDistanceFromCenter: function( group ) {
      // this only works on pair groups adjacent to the central atom
      var bond = this.getParentBond( group );
      assert && assert( bond.contains( this.centralAtom ) );

      return group.isLonePair ? PairGroup.LONE_PAIR_DISTANCE : bond.length * PairGroup.REAL_TMP_SCALE;
    },

    addTerminalLonePairs: function( atom, quantity ) {
      var pairConfig = new VseprConfiguration( 1, quantity );
      var lonePairOrientations = pairConfig.geometry.unitVectors;
      var mapping = AttractorModel.findClosestMatchingConfiguration(
        // last vector should be lowest energy (best bond if ambiguous), and is negated for the proper coordinate frame
        [ atom.position.normalized() ], // TODO: why did this have to get changed to non-negated?
        [ lonePairOrientations.get( lonePairOrientations.size() - 1 ).negated() ],
        [ Permutation.identity( 1 ) ]
      );

      for ( var i = 0; i < quantity; i++ ) {
        // mapped into our coordinates
        var lonePairOrientation = mapping.rotateVector( lonePairOrientations[i] );
        this.addGroupAndBond( new PairGroup( atom.position.plus( lonePairOrientation.times( PairGroup.LONE_PAIR_DISTANCE ) ), true, false ), atom, 0 );
      }
    }
  } );
} );
