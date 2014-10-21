// Copyright 2002-2014, University of Colorado Boulder

/**
 * Represents a physically malleable version of a real molecule, with lone pairs if necessary.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );
  var Molecule = require( 'MOLECULE_SHAPES/common/model/Molecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var VseprConfiguration = require( 'MOLECULE_SHAPES/common/model/VseprConfiguration' );

  /*
   * @constructor
   * @param {RealMoleculeShape} realMoleculeShape
   */
  function RealMolecule( realMoleculeShape ) {
    var i, group;

    Molecule.call( this );

    this.realMoleculeShape = realMoleculeShape;
    this.localShapeMap = {}; // {number} atom ID => {LocalShape}

    var numLonePairs = realMoleculeShape.centralAtom.lonePairCount;
    var numBonds = realMoleculeShape.bonds.length;

    var idealCentralOrientations = [];
    var radialGroups = [];

    this.addCentralAtom( new PairGroup( new Vector3(), false, realMoleculeShape.centralAtom.element ) );

    // add in bonds
    var bonds = realMoleculeShape.bonds;
    for ( i = 0; i < bonds.length; i++ ) {
      var bond = bonds[i];
      var atom = bond.getOtherAtom( realMoleculeShape.centralAtom );
      idealCentralOrientations.push( atom.orientation );
      var bondLength = atom.position.magnitude();

      var atomLocation = atom.orientation.times( bondLength );
      group = new PairGroup( atomLocation, false, atom.element );
      radialGroups.push( group );

      // add the atom itself
      this.addGroupAndBond( group, this.centralAtom, bond.order, bondLength );

      // add the lone pairs onto the atom
      this.addTerminalLonePairs( group, atom.lonePairCount );
    }

    // all of the ideal vectors (including for lone pairs)
    var vseprConfiguration = VseprConfiguration.getConfiguration( numBonds, numLonePairs );
    var idealModelVectors = vseprConfiguration.allOrientations;

    var mapping = vseprConfiguration.getIdealBondRotationToPositions( LocalShape.sortedLonePairsFirst( this.radialAtoms ) );

    // add in lone pairs in their correct "initial" positions
    for ( i = 0; i < numLonePairs; i++ ) {
      var orientation = mapping.rotateVector( idealModelVectors[i] );
      idealCentralOrientations.push( orientation );
      group = new PairGroup( orientation.times( PairGroup.LONE_PAIR_DISTANCE ), true );
      this.addGroupAndBond( group, this.centralAtom, 0, PairGroup.LONE_PAIR_DISTANCE );
      radialGroups.push( group );
    }

    this.localShapeMap[this.centralAtom.id] = new LocalShape( LocalShape.realPermutations( radialGroups ), this.centralAtom, radialGroups, idealCentralOrientations );

    // basically only use VSEPR model for the attraction on non-central atoms
    var radialAtoms = this.radialAtoms;
    for ( i = 0; i < radialAtoms.length; i++ ) {
      this.localShapeMap[radialAtoms[i].id] = this.getLocalVSEPRShape( radialAtoms[i] );
    }
  }

  return inherit( Molecule, RealMolecule, {
    update: function( dt ) {
      Molecule.prototype.update.call( this, dt );

      // angle-based repulsion
      var numAtoms = this.atoms.length;
      for ( var i = 0; i < numAtoms; i++ ) {
        var atom = this.atoms[i];
        if ( this.getNeighborCount( atom ) > 1 ) {
          var localShape = this.getLocalShape( atom );

          localShape.applyAngleAttractionRepulsion( dt );
        }
      }
    },

    getLocalShape: function( atom ) {
      return this.localShapeMap[atom.id];
    },

    isReal: true,

    getMaximumBondLength: function() {
      return undefined;
    }
  } );
} );
