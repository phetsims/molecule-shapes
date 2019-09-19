// Copyright 2013-2017, University of Colorado Boulder

/**
 * A molecule that behaves with a behavior that doesn't discriminate between bond or atom types (only lone pairs vs
 * bonds). Used in the "Model" screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const Molecule = require( 'MOLECULE_SHAPES/common/model/Molecule' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );

  /*
   * @constructor
   * @param {number} bondLengthOverride - Override the length of the displayed bond (the bond will not stretch between
   *                                      both atoms, but will be able to detach from the central atom to stay the same
   *                                      length)
   */
  function VSEPRMolecule( bondLengthOverride ) {
    Molecule.call( this, false );

    this.bondLengthOverride = bondLengthOverride; // @public {number}
  }

  moleculeShapes.register( 'VSEPRMolecule', VSEPRMolecule );

  return inherit( Molecule, VSEPRMolecule, {
    /**
     * Steps the model.
     * @override
     * @public
     *
     * @param {number} dt - Amount of time elapsed
     */
    update: function( dt ) {
      Molecule.prototype.update.call( this, dt );

      var radialGroups = this.radialGroups;

      // coulomb-style repulsion around the central atom (or angle-based for terminal lone pairs)
      for ( var i = 0; i < this.atoms.length; i++ ) {
        var atom = this.atoms[ i ];
        if ( this.getNeighborCount( atom ) > 1 ) {
          if ( atom.isCentralAtom ) {
            // attractive force to the correct position
            var error = this.getLocalShape( atom ).applyAttraction( dt );

            // factor that basically states "if we are close to an ideal state, force the coulomb force to ignore differences between bonds and lone pairs based on their distance"
            var trueLengthsRatioOverride = Math.max( 0, Math.min( 1, Math.log( error + 1 ) - 0.5 ) );

            for ( var j = 0; j < radialGroups.length; j++ ) {
              var group = radialGroups[ j ];
              for ( var k = 0; k < radialGroups.length; k++ ) {
                var otherGroup = radialGroups[ k ];

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
    },

    /**
     * Returns the LocalShape around a specific atom.
     * @public
     *
     * @param {PairGroup} atom
     * @returns {LocalShape}
     */
    getLocalShape: function( atom ) {
      return this.getLocalVSEPRShape( atom );
    },

    /**
     * Returns the maximum bond length (either overridden, or the normal bonded pair distance).
     * @override
     * @public
     *
     * @returns {number}
     */
    getMaximumBondLength: function() {
      if ( this.bondLengthOverride !== undefined ) {
        return this.bondLengthOverride;
      }
      else {
        return PairGroup.BONDED_PAIR_DISTANCE;
      }
    }
  } );
} );
