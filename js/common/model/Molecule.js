// Copyright 2013-2020, University of Colorado Boulder

/**
 * Base type of model of a single-atom-centered molecule which has a certain number of pair groups
 * surrounding it. Concrete sub-types should implement the methods documented at the start of the prototype.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import inherit from '../../../../phet-core/js/inherit.js';
import moleculeShapes from '../../moleculeShapes.js';
import Bond from './Bond.js';
import LocalShape from './LocalShape.js';
import PairGroup from './PairGroup.js';
import VSEPRConfiguration from './VSEPRConfiguration.js';

const MAX_PAIRS = 6;

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

  this.isReal = isReal; // @public {boolean} - Whether this molecule is based on real angles or on a model.

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

  // @public {TinyEmitter}
  this.bondAddedEmitter = new TinyEmitter(); // emits with: bond
  this.bondRemovedEmitter = new TinyEmitter(); // emits with: bond
  this.bondChangedEmitter = new TinyEmitter(); // emits with: bond
  this.groupAddedEmitter = new TinyEmitter(); // emits with: group
  this.groupRemovedEmitter = new TinyEmitter(); // emits with: group
  this.groupChangedEmitter = new TinyEmitter(); // emits with: group

  // composite events
  this.bondAddedEmitter.addListener( bond => this.bondChangedEmitter.emit( bond ) );
  this.bondRemovedEmitter.addListener( bond => this.bondChangedEmitter.emit( bond ) );
  this.groupAddedEmitter.addListener( group => this.groupChangedEmitter.emit( group ) );
  this.groupRemovedEmitter.addListener( group => this.groupChangedEmitter.emit( group ) );
}

moleculeShapes.register( 'Molecule', Molecule );

export default inherit( Object, Molecule, {
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
    const numGroups = this.groups.length;
    for ( let i = 0; i < numGroups; i++ ) {
      const group = this.groups[ i ];

      // ignore processing on the central atom
      if ( group === this.centralAtom ) {
        continue;
      }

      const parentBond = this.getParentBond( group );
      const parentGroup = parentBond.getOtherAtom( group );

      // store the old distance before stepping in time
      const oldDistance = group.positionProperty.get().distance( parentGroup.positionProperty.get() );

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
    let count = 0;
    for ( let i = 0; i < this.bonds.length; i++ ) {
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
      const centralAtom = this.centralAtom;
      const result = _.filter( this.getBondsAround( group ), function( bond ) { return bond.getOtherAtom( group ) === centralAtom; } )[ 0 ];
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
   * @param {number} [bondLength] - Length of the bond.
   */
  addGroupAndBond: function( group, parent, bondOrder, bondLength ) {
    // add the group, but delay notifications (inconsistent state)
    this.addGroup( group, false );

    bondLength = bondLength || group.positionProperty.get().minus( parent.positionProperty.get() ).magnitude;

    // add the bond after the group so we can reference things properly
    this.addBond( new Bond( group, parent, bondOrder, bondLength ) );

    // notify after bond added, so we don't send notifications in an inconsistent state
    this.groupAddedEmitter.emit( group );
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
      this.groupAddedEmitter.emit( group );
    }
  },

  /**
   * Adds a bond to the molecule.
   * @public
   *
   * @param {Bond.<PairGroup>}
   */
  addBond: function( bond ) {
    const isLonePairBond = bond.order === 0;

    addToEndOfArray( this.bonds, bond, isLonePairBond );

    if ( bond.contains( this.centralAtom ) ) {
      const group = bond.getOtherAtom( this.centralAtom );
      addToEndOfArray( this.radialGroups, group, isLonePairBond );
      if ( group.isLonePair ) {
        addToEndOfArray( this.radialLonePairs, group, isLonePairBond );
      }
      else {
        addToEndOfArray( this.radialAtoms, group, isLonePairBond );
      }
    }

    this.bondAddedEmitter.emit( bond );
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
      const group = bond.getOtherAtom( this.centralAtom );
      arrayRemove( this.radialGroups, group );
      if ( group.isLonePair ) {
        arrayRemove( this.radialLonePairs, group );
      }
      else {
        arrayRemove( this.radialAtoms, group );
      }
    }

    this.bondRemovedEmitter.emit( bond );
  },

  /**
   * Removes a pair group from the molecule (and any attached bonds)
   * @public
   *
   * @param {PairGroup}
   */
  removeGroup: function( group ) {
    let i;

    assert && assert( this.centralAtom !== group );

    // remove all of its bonds first
    const bondList = this.getBondsAround( group );
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
    this.groupRemovedEmitter.emit( group );
    for ( i = 0; i < bondList.length; i++ ) {
      // delayed notification for bond removal
      this.bondRemovedEmitter.emit( bondList[ i ] );
    }
  },

  /**
   * Removes all pair groups (and thus bonds) from the molecule.
   * @public
   */
  removeAllGroups: function() {
    const groupsCopy = this.groups.slice();
    for ( let i = 0; i < groupsCopy.length; i++ ) {
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
    const closeLonePairs = this.radialLonePairs;
    return _.filter( this.lonePairs, function( lonePair ) { return !_.includes( closeLonePairs, lonePair ); } );
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
    const groups = this.getNeighbors( atom );

    // count lone pairs
    let numLonePairs = 0;
    for ( let i = 0; i < groups.length; i++ ) {
      if ( groups[ i ].isLonePair ) {
        numLonePairs++;
      }
    }

    const numAtoms = groups.length - numLonePairs;
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
    const bond = this.getParentBond( group );
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
    const pairConfig = VSEPRConfiguration.getConfiguration( 1, quantity );
    const lonePairOrientations = pairConfig.geometry.unitVectors;

    // we want to rotate the ideal configuration of lone pairs to the atom's orientation
    const matrix = Matrix3.rotateAToB( lonePairOrientations[ lonePairOrientations.length - 1 ].negated(), atom.orientation );

    for ( let i = 0; i < quantity; i++ ) {
      // mapped into our coordinates
      const lonePairOrientation = matrix.timesVector3( lonePairOrientations[ i ] );
      this.addGroupAndBond( new PairGroup( atom.positionProperty.get().plus( lonePairOrientation.times( PairGroup.LONE_PAIR_DISTANCE ) ), true ), atom, 0 );
    }
  }
} );