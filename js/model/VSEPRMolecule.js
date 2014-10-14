// Copyright 2002-2014, University of Colorado Boulder

/**
 * A molecule that behaves with a behavior that doesn't discriminate between bond or atom types (only lone pairs vs bonds)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Molecule = require( 'MOLECULE_SHAPES/model/Molecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );

  function VSEPRMolecule( bondLengthOverride ) {
    Molecule.call( this );

    this.bondLengthOverride = bondLengthOverride;
  }

  return inherit( Molecule, VSEPRMolecule, {
    update: function( tpf ) {
      Molecule.prototype.update.call( this, tpf );

      var radialGroups = this.getRadialGroups();

      for ( var i = 0; i < this.atoms.length; i++ ) {
        var atom = this.atoms[i];
        if ( this.getNeighbors( atom ).length > 1 ) {
          if ( atom.isCentralAtom() ) {
            // attractive force to the correct position
            var error = this.getLocalShape( atom ).applyAttraction( tpf );

            // factor that basically states "if we are close to an ideal state, force the coulomb force to ignore differences between bonds and lone pairs based on their distance"
            var trueLengthsRatioOverride = Math.max( 0, Math.min( 1, Math.log( error + 1 ) - 0.5 ) );

            for ( var j = 0; j < radialGroups.length; j++ ) {
              var group = radialGroups[j];
              for ( var k = 0; k < radialGroups.length; k++ ) {
                var otherGroup = radialGroups[k];

                if ( otherGroup !== group && group !== this.getCentralAtom() ) {
                  group.repulseFrom( otherGroup, tpf, trueLengthsRatioOverride );
                }
              }
            }
          }
          else {
            // handle terminal lone pairs gracefully
            this.getLocalShape( atom ).applyAngleAttractionRepulsion( tpf );
          }
        }
      }
    },

    getLocalShape: function( atom ) {
      return this.getLocalVSEPRShape( atom );
    },

    isReal: false,

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
