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
  var LocalShape = require( 'MOLECULE_SHAPES/model/LocalShape' );
  var Molecule = require( 'MOLECULE_SHAPES/model/Molecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );
  var VseprConfiguration = require( 'MOLECULE_SHAPES/model/VseprConfiguration' );

  function RealMolecule( realMolecule ) {
    var i, group, normalizedPosition;

    Molecule.call( this );

    this.realMolecule = realMolecule;

    this.elementsUsed = {};
    this.localShapeMap = {};

    var numLonePairs = realMolecule.getCentralLonePairCount();
    var numBonds = realMolecule.getBonds().length;

    var idealCentralOrientations = [];
    var centralPairGroups = [];

    this.addCentralAtom( new PairGroup( new Vector3(), false, false, realMolecule.getCentralAtom().getElement() ) );

    // add in bonds
    var bonds = realMolecule.getBonds();
    for ( i = 0; i < bonds.length; i++ ) {
      var bond = bonds[i];
      var atom = bond.getOtherAtom( realMolecule.getCentralAtom() );
      normalizedPosition = atom.position.normalized();
      idealCentralOrientations.push( normalizedPosition );
      var bondLength = atom.position.magnitude();

      var atomLocation = normalizedPosition.times( PairGroup.REAL_TMP_SCALE * bondLength );
      group = new PairGroup( atomLocation, false, false, atom.getElement() );
      centralPairGroups.add( group );
      this.addGroupAndBond( group, this.getCentralAtom(), bond.order, bondLength );
      this.elementsUsed.add( atom.getElement() );

      this.addTerminalLonePairs( group, atom.lonePairCount );
    }

    // all of the ideal vectors (including for lone pairs)
    var vseprConfiguration = new VseprConfiguration( numBonds, numLonePairs );
    var idealModelVectors = vseprConfiguration.getAllUnitVectors();

    var mapping = vseprConfiguration.getIdealBondRotationToPositions( LocalShape.sortedLonePairsFirst( this.getNeighboringAtoms( this.getCentralAtom() ) ) );

    // add in lone pairs in their correct "initial" positions
    for ( i = 0; i < numLonePairs; i++ ) {
      normalizedPosition = mapping.rotateVector( idealModelVectors.get( i ) );
      idealCentralOrientations.add( normalizedPosition );
      group = new PairGroup( normalizedPosition.times( PairGroup.LONE_PAIR_DISTANCE ), true, false );
      this.addGroupAndBond( group, this.getCentralAtom(), 0, PairGroup.LONE_PAIR_DISTANCE / PairGroup.REAL_TMP_SCALE );
      centralPairGroups.add( group );
    }

    this.localShapeMap[this.getCentralAtom().id] = new LocalShape( LocalShape.realPermutations( centralPairGroups ), this.getCentralAtom(), centralPairGroups, idealCentralOrientations );

    // basically only use VSEPR model for the attraction on non-central atoms
    var radialAtoms = this.getRadialAtoms();
    for ( i = 0; i < radialAtoms.length; i++ ) {
      this.localShapeMap[radialAtoms[i].id] = this.getLocalVSEPRShape( radialAtoms[i] );
    }
  }

  return inherit( Molecule, RealMolecule, {
    update: function( tpf ) {
      Molecule.prototype.update.call( this, tpf );

      // angle-based repulsion
      var atoms = this.getAtoms();
      for ( var i = 0; i < atoms.length; i++ ) {
        var atom = atoms[i];
        var neighbors = this.getNeighbors( atom );
        if ( neighbors.length > 1 ) {
          var localShape = this.getLocalShape( atom );

          localShape.applyAngleAttractionRepulsion( tpf );
        }
      }
    },

    getLocalShape: function( atom ) {
      return this.localShapeMap[atom.id];
    },

    isReal: true,

    getMaximumBondLength: function() {
      return undefined;
    },

    getRealMolecule: function() {
      return this.realMolecule;
    }
  } );
} );
