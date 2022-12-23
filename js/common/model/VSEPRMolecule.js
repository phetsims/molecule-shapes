// Copyright 2013-2022, University of Colorado Boulder

/**
 * A molecule that behaves with a behavior that doesn't discriminate between bond or atom types (only lone pairs vs
 * bonds). Used in the "Model" screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../moleculeShapes.js';
import Molecule from './Molecule.js';
import PairGroup from './PairGroup.js';

class VSEPRMolecule extends Molecule {
  constructor() {
    super( false );

    // @public {number|null}
    // Override the length of the displayed bond (the bond will not stretch between both atoms, but will be able to
    // detach from the central atom to stay the same length)
    this.bondLengthOverride = null;
  }

  /**
   * Steps the model.
   * @override
   * @public
   *
   * @param {number} dt - Amount of time elapsed
   */
  update( dt ) {
    super.update( dt );

    const radialGroups = this.radialGroups;

    // coulomb-style repulsion around the central atom (or angle-based for terminal lone pairs)
    for ( let i = 0; i < this.atoms.length; i++ ) {
      const atom = this.atoms[ i ];
      if ( this.getNeighborCount( atom ) > 1 ) {
        if ( atom.isCentralAtom ) {
          // attractive force to the correct position
          const error = this.getLocalShape( atom ).applyAttraction( dt );

          // factor that basically states "if we are close to an ideal state, force the coulomb force to ignore differences between bonds and lone pairs based on their distance"
          const trueLengthsRatioOverride = Math.max( 0, Math.min( 1, Math.log( error + 1 ) - 0.5 ) );

          for ( let j = 0; j < radialGroups.length; j++ ) {
            const group = radialGroups[ j ];
            for ( let k = 0; k < radialGroups.length; k++ ) {
              const otherGroup = radialGroups[ k ];

              if ( otherGroup !== group && group !== this.centralAtom ) {
                group.repulseFrom( otherGroup, dt, trueLengthsRatioOverride );
              }
            }
          }
        }
        else {
          // handle terminal lone pairs gracefully
          this.getLocalShape( atom ).applyAngleAttractionRepulsion( dt );
        }
      }
    }
  }

  /**
   * Returns the LocalShape around a specific atom.
   * @public
   *
   * @param {PairGroup} atom
   * @returns {LocalShape}
   */
  getLocalShape( atom ) {
    return this.getLocalVSEPRShape( atom );
  }

  /**
   * Returns the maximum bond length (either overridden, or the normal bonded pair distance).
   * @override
   * @public
   *
   * @returns {number}
   */
  getMaximumBondLength() {

    // PhET-iO sets a null value
    if ( this.bondLengthOverride !== null ) {
      return this.bondLengthOverride;
    }
    else {
      return PairGroup.BONDED_PAIR_DISTANCE;
    }
  }
}

moleculeShapes.register( 'VSEPRMolecule', VSEPRMolecule );

export default VSEPRMolecule;