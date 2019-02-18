// Copyright 2013-2019, University of Colorado Boulder

/**
 * Represents a physically malleable version of a real molecule, with lone pairs if necessary.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );
  var Molecule = require( 'MOLECULE_SHAPES/common/model/Molecule' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var Vector3 = require( 'DOT/Vector3' );
  var VSEPRConfiguration = require( 'MOLECULE_SHAPES/common/model/VSEPRConfiguration' );

  /*
   * @constructor
   * @param {RealMoleculeShape} realMoleculeShape
   */
  function RealMolecule( realMoleculeShape ) {
    var i;
    var group;

    Molecule.call( this, true );

    this.realMoleculeShape = realMoleculeShape; // @public {RealMoleculeShape} - Our ideal shape
    this.localShapeMap = {}; // @private {number} - Maps atom IDs => {LocalShape}

    var numLonePairs = realMoleculeShape.centralAtom.lonePairCount;
    var numBonds = realMoleculeShape.bonds.length;

    var idealCentralOrientations = [];
    var radialGroups = [];

    this.addCentralAtom( new PairGroup( new Vector3( 0, 0, 0 ), false, {
      element: realMoleculeShape.centralAtom.element
    } ) );

    // add in bonds
    var bonds = realMoleculeShape.bonds;
    for ( i = 0; i < bonds.length; i++ ) {
      var bond = bonds[ i ];
      var atom = bond.getOtherAtom( realMoleculeShape.centralAtom );
      idealCentralOrientations.push( atom.orientation );
      var bondLength = atom.position.magnitude();

      var atomLocation = atom.orientation.times( bondLength );
      group = new PairGroup( atomLocation, false, {
        element: atom.element
      } );
      radialGroups.push( group );

      // add the atom itself
      this.addGroupAndBond( group, this.centralAtom, bond.order, bondLength );

      // add the lone pairs onto the atom
      this.addTerminalLonePairs( group, atom.lonePairCount );
    }

    // all of the ideal vectors (including for lone pairs)
    var vseprConfiguration = VSEPRConfiguration.getConfiguration( numBonds, numLonePairs );
    var idealModelVectors = vseprConfiguration.allOrientations;

    var mapping = vseprConfiguration.getIdealBondRotationToPositions( this.radialAtoms );

    // add in lone pairs in their correct "initial" positions
    for ( i = 0; i < numLonePairs; i++ ) {
      var orientation = mapping.rotateVector( idealModelVectors[ i ] );
      idealCentralOrientations.push( orientation );
      group = new PairGroup( orientation.times( PairGroup.LONE_PAIR_DISTANCE ), true );
      this.addGroupAndBond( group, this.centralAtom, 0, PairGroup.LONE_PAIR_DISTANCE );
      radialGroups.push( group );
    }

    this.localShapeMap[ this.centralAtom.id ] = new LocalShape( LocalShape.realPermutations( radialGroups ), this.centralAtom, radialGroups, idealCentralOrientations );

    // basically only use VSEPR model for the attraction on non-central atoms
    var radialAtoms = this.radialAtoms;
    for ( i = 0; i < radialAtoms.length; i++ ) {
      this.localShapeMap[ radialAtoms[ i ].id ] = this.getLocalVSEPRShape( radialAtoms[ i ] );
    }
  }

  moleculeShapes.register( 'RealMolecule', RealMolecule );

  return inherit( Molecule, RealMolecule, {
    /**
     * Step function for the molecule.
     * @override
     * @public
     *
     * @param {number} dt - Amount of time elapsed
     */
    update: function( dt ) {
      Molecule.prototype.update.call( this, dt );

      // angle-based repulsion
      var numAtoms = this.atoms.length;
      for ( var i = 0; i < numAtoms; i++ ) {
        var atom = this.atoms[ i ];
        if ( this.getNeighborCount( atom ) > 1 ) {
          var localShape = this.getLocalShape( atom );

          localShape.applyAngleAttractionRepulsion( dt );
        }
      }
    },

    /**
     * Looks up a LocalShape for a particular atom.
     * @public
     *
     * @param {PairGroup} atom
     * @returns {LocalShape}
     */
    getLocalShape: function( atom ) {
      return this.localShapeMap[ atom.id ];
    },

    /**
     * @override - We don't want to specify this for real molecules.
     * @returns {undefined}
     */
    getMaximumBondLength: function() {
      return undefined;
    }
  } );
} );
