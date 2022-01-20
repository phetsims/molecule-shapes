// Copyright 2013-2022, University of Colorado Boulder

/**
 * Represents a physically malleable version of a real molecule, with lone pairs if necessary.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../../dot/js/Vector3.js';
import moleculeShapes from '../../moleculeShapes.js';
import LocalShape from './LocalShape.js';
import Molecule from './Molecule.js';
import PairGroup from './PairGroup.js';
import VSEPRConfiguration from './VSEPRConfiguration.js';

class RealMolecule extends Molecule {
  /*
   * @param {RealMoleculeShape} realMoleculeShape
   */
  constructor( realMoleculeShape ) {
    let i;
    let group;

    super( true );

    this.realMoleculeShape = realMoleculeShape; // @public {RealMoleculeShape} - Our ideal shape
    this.localShapeMap = {}; // @private {number} - Maps atom IDs => {LocalShape}

    this.lastPermutations = [];

    const numLonePairs = realMoleculeShape.centralAtom.lonePairCount;
    const numBonds = realMoleculeShape.bonds.length;

    const idealCentralOrientations = [];
    const radialGroups = [];

    this.addCentralAtom( new PairGroup( new Vector3( 0, 0, 0 ), false, {
      element: realMoleculeShape.centralAtom.element
    } ) );

    // add in bonds
    const bonds = realMoleculeShape.bonds;
    for ( i = 0; i < bonds.length; i++ ) {
      const bond = bonds[ i ];
      const atom = bond.getOtherAtom( realMoleculeShape.centralAtom );
      idealCentralOrientations.push( atom.orientation );
      const bondLength = atom.position.magnitude;

      const atomPosition = atom.orientation.times( bondLength );
      group = new PairGroup( atomPosition, false, {
        element: atom.element
      } );
      radialGroups.push( group );

      // add the atom itself
      this.addGroupAndBond( group, this.centralAtom, bond.order, bondLength );

      // add the lone pairs onto the atom
      this.addTerminalLonePairs( group, atom.lonePairCount );
    }

    // all of the ideal vectors (including for lone pairs)
    const vseprConfiguration = VSEPRConfiguration.getConfiguration( numBonds, numLonePairs );
    const idealModelVectors = vseprConfiguration.allOrientations;

    const mapping = vseprConfiguration.getIdealBondRotationToPositions( this.radialAtoms );

    // add in lone pairs in their correct "initial" positions
    for ( i = 0; i < numLonePairs; i++ ) {
      const orientation = mapping.rotateVector( idealModelVectors[ i ] );
      idealCentralOrientations.push( orientation );
      group = new PairGroup( orientation.times( PairGroup.LONE_PAIR_DISTANCE ), true );
      this.addGroupAndBond( group, this.centralAtom, 0, PairGroup.LONE_PAIR_DISTANCE );
      radialGroups.push( group );
    }

    this.localShapeMap[ this.centralAtom.id ] = new LocalShape( LocalShape.realPermutations( radialGroups ), this.centralAtom, radialGroups, idealCentralOrientations );

    // basically only use VSEPR model for the attraction on non-central atoms
    const radialAtoms = this.radialAtoms;
    for ( i = 0; i < radialAtoms.length; i++ ) {
      this.localShapeMap[ radialAtoms[ i ].id ] = this.getLocalVSEPRShape( radialAtoms[ i ] );
    }
  }

  /**
   * Step function for the molecule.
   * @override
   * @public
   *
   * @param {number} dt - Amount of time elapsed
   */
  update( dt ) {
    super.update( dt );

    // angle-based repulsion
    const numAtoms = this.atoms.length;
    for ( let i = 0; i < numAtoms; i++ ) {
      const atom = this.atoms[ i ];
      if ( this.getNeighborCount( atom ) > 1 ) {
        const localShape = this.getLocalShape( atom );

        const permutation = localShape.applyAngleAttractionRepulsion( dt, this.lastPermutations[ i ] || undefined ).permutation;
        this.lastPermutations[ i ] = permutation;
      }
    }
  }

  /**
   * Looks up a LocalShape for a particular atom.
   * @public
   *
   * @param {PairGroup} atom
   * @returns {LocalShape}
   */
  getLocalShape( atom ) {
    return this.localShapeMap[ atom.id ];
  }

  /**
   * @public
   * @override - We don't want to specify this for real molecules.
   * @returns {undefined}
   */
  getMaximumBondLength() {
    return undefined;
  }
}

moleculeShapes.register( 'RealMolecule', RealMolecule );

export default RealMolecule;
