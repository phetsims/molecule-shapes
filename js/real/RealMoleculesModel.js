// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model for the 'Real' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Vector3 from '../../../dot/js/Vector3.js';
import inherit from '../../../phet-core/js/inherit.js';
import AttractorModel from '../common/model/AttractorModel.js';
import LocalShape from '../common/model/LocalShape.js';
import MoleculeShapesModel from '../common/model/MoleculeShapesModel.js';
import PairGroup from '../common/model/PairGroup.js';
import RealMolecule from '../common/model/RealMolecule.js';
import RealMoleculeShape from '../common/model/RealMoleculeShape.js';
import VSEPRConfiguration from '../common/model/VSEPRConfiguration.js';
import VSEPRMolecule from '../common/model/VSEPRMolecule.js';
import moleculeShapes from '../moleculeShapes.js';

/**
 * @constructor
 * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
 */
function RealMoleculesModel( isBasicsVersion ) {
  const self = this;

  const startingMoleculeShape = isBasicsVersion ? RealMoleculeShape.TAB_2_BASIC_MOLECULES[ 0 ] : RealMoleculeShape.TAB_2_MOLECULES[ 0 ];
  const startingMolecule = new RealMolecule( startingMoleculeShape );

  MoleculeShapesModel.call( this, isBasicsVersion );
  this.moleculeProperty = new Property( startingMolecule ); // @override {Molecule}
  this.realMoleculeShapeProperty = new Property( startingMoleculeShape ); // {RealMoleculeShape}
  this.showRealViewProperty = new Property( true ); // whether the "Real" or "Model" view is shown


  this.showRealViewProperty.lazyLink( function() {
    self.rebuildMolecule( false );
  } );

  this.realMoleculeShapeProperty.lazyLink( function() {
    self.rebuildMolecule( true );
    self.moleculeQuaternionProperty.reset();
  } );
}

moleculeShapes.register( 'RealMoleculesModel', RealMoleculesModel );

inherit( MoleculeShapesModel, RealMoleculesModel, {
  /**
   * @public
   */
  reset: function() {
    MoleculeShapesModel.prototype.reset.call( this );
    this.moleculeProperty.reset();
    this.realMoleculeShapeProperty.reset();
    this.showRealViewProperty.reset();
    this.rebuildMolecule( true );
  },

  /*
   * Rebuilds our model molecule based on the possibly new "showRealView" or "realMoleculeShape".
   * @private
   *
   * @param {boolean} switchedRealMolecule - If false, we orient the new (model/real) view to the best match of the
   *                                         old (real/model) view. If true, the molecule type changed, so we don't
   *                                         do any matching of orientation.
   */
  rebuildMolecule: function( switchedRealMolecule ) {
    const molecule = this.moleculeProperty.get();

    const numRadialAtoms = this.realMoleculeShapeProperty.get().centralAtomCount;
    const numRadialLonePairs = this.realMoleculeShapeProperty.get().centralAtom.lonePairCount;
    const vseprConfiguration = VSEPRConfiguration.getConfiguration( numRadialAtoms, numRadialLonePairs );

    // get a copy of what might be the "old" molecule into whose space we need to rotate into
    let mappingMolecule;
    if ( switchedRealMolecule ) {
      // rebuild from scratch
      mappingMolecule = new RealMolecule( this.realMoleculeShapeProperty.get() );
    }
    else {
      // base the rotation on our original
      mappingMolecule = molecule;
    }

    let newMolecule;
    let mapping;
    if ( this.showRealViewProperty.get() ) {
      newMolecule = new RealMolecule( this.realMoleculeShapeProperty.get() );
      if ( !switchedRealMolecule ) {
        // NOTE: this might miss a couple improper mappings?

        // compute the mapping from our "ideal" to our "old" molecule
        const groups = new RealMolecule( this.realMoleculeShapeProperty.get() ).radialGroups;
        mapping = AttractorModel.findClosestMatchingConfiguration(
          AttractorModel.getOrientationsFromOrigin( mappingMolecule.radialGroups ),
          _.map( groups, function( pair ) {
            return pair.orientation;
          } ),
          LocalShape.vseprPermutations( mappingMolecule.radialGroups ) );
        _.each( newMolecule.groups, function( group ) {
          if ( group !== newMolecule.centralAtom ) {
            group.positionProperty.set( mapping.rotateVector( group.positionProperty.get() ) );
          }
        } );
      }

    }
    else {
      mapping = vseprConfiguration.getIdealGroupRotationToPositions( mappingMolecule.radialGroups );
      const permutation = mapping.permutation.inverted();
      const idealUnitVectors = vseprConfiguration.allOrientations;

      newMolecule = new VSEPRMolecule();

      const newCentralAtom = new PairGroup( new Vector3( 0, 0, 0 ), false );
      newMolecule.addCentralAtom( newCentralAtom );
      for ( let i = 0; i < numRadialAtoms + numRadialLonePairs; i++ ) {
        const unitVector = mapping.rotateVector( idealUnitVectors[ i ] );
        if ( i < numRadialLonePairs ) {
          newMolecule.addGroupAndBond( new PairGroup( unitVector.times( PairGroup.LONE_PAIR_DISTANCE ), true ), newCentralAtom, 0 );
        }
        else {
          // we need to dig the bond order out of the mapping molecule, and we need to pick the right one (thus the permutation being applied, at an offset)
          const oldRadialGroup = mappingMolecule.radialAtoms[ permutation.apply( i ) - numRadialLonePairs ];
          const bond = mappingMolecule.getParentBond( oldRadialGroup );
          const group = new PairGroup( unitVector.times( bond.length ), false );
          newMolecule.addGroupAndBond( group, newCentralAtom, bond.order, bond.length );

          newMolecule.addTerminalLonePairs( group, _.filter( mappingMolecule.getNeighbors( oldRadialGroup ), function( group ) { return group.isLonePair; } ).length );
        }
      }
    }

    this.moleculeProperty.set( newMolecule );
  }
} );

export default RealMoleculesModel;