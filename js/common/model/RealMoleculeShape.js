// Copyright 2002-2014, University of Colorado Boulder

/**
 * Represents a 'real' molecule with exact positions, as opposed to a molecule model (which is VSEPR-based
 * and doesn't include other information).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var DotUtil = require( 'DOT/Util' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var RealAtomLocation = require( 'MOLECULE_SHAPES/common/model/RealAtomLocation' );
  var Bond = require( 'MOLECULE_SHAPES/common/model/Bond' );
  var GeometryConfiguration = require( 'MOLECULE_SHAPES/common/model/GeometryConfiguration' );

  // Instead of the absolute positioning, this (for now) sets the bond lengths to be the same, since for our purposes
  // they are all very close.
  var USE_SIMPLIFIED_BOND_LENGTH = true;

  /*
   * @constructor
   * @param {string} displayName - The displayed chemical name. Digits will be turned into subscripts, so use "H20", etc.
   * @param {number | null} bondLengthOverride - If USE_SIMPLIFIED_BOND_LENGTH, this will be used as the bond length for
   *                                             all atoms.
   */
  function RealMoleculeShape( displayName, bondLengthOverride ) {
    this.displayName = displayName;
    this.bondLengthOverride = bondLengthOverride * 5.5; // upscale the true size to our model units

    this.atoms = []; // {RealAtomLocation[]}
    this.bonds = []; // {Bond[]}
    this.centralAtom = null; // {RealAtomLocation}

    this.centralAtomCount = 0;
  }

  inherit( Object, RealMoleculeShape, {
    addAtom: function( atom ) {
      assert && assert( this.atoms.indexOf( atom ) === -1 );

      this.atoms.push( atom );
    },

    addBond: function( a, b, order, bondLength ) {
      this.bonds.push( new Bond( a, b, order, bondLength ) );

      if ( a === this.centralAtom || b === this.centralAtom ) {
        this.centralAtomCount++;
      }
    },

    addCentralAtom: function( atom ) {
      this.addAtom( atom );
      this.centralAtom = atom;
    },

    addRadialAtom: function( atom, bondOrder ) {
      if ( USE_SIMPLIFIED_BOND_LENGTH ) {
        // adjust the position's magnitude to the proper scale
        atom.position.normalize().multiplyScalar( this.bondLengthOverride );
      }
      this.addAtom( atom );
      this.addBond( atom, this.centralAtom, bondOrder, USE_SIMPLIFIED_BOND_LENGTH ? this.bondLengthOverride : atom.position.magnitude() );
    },

    toString: function() {
      return this.displayName;
    }
  } );

  var createMoleculeShape = function( name, length, callback ) {
    var shape = new RealMoleculeShape( name, length );
    callback( shape );
    return shape;
  };

  var B = Element.B;
  var Be = Element.Be;
  var C = Element.C;
  var Cl = Element.Cl;
  var F = Element.F;
  var H = Element.H;
  var N = Element.N;
  var O = Element.O;
  var P = Element.P;
  var S = Element.S;
  var Xe = Element.Xe;

  RealMoleculeShape.BERYLLIUM_CHLORIDE = createMoleculeShape( 'BeCl2', 1.8, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( Be, new Vector3() ) );
    shape.addRadialAtom( new RealAtomLocation( Cl, new Vector3( 1.8, 0, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( Cl, new Vector3( -1.8, 0, 0 ), 3 ), 1 );
  } );

  RealMoleculeShape.BORON_TRIFLUORIDE = createMoleculeShape( 'BF3', 1.313, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( B, new Vector3() ) );
    var angle = 2 * Math.PI / 3;
    var bondLength = 1.313;
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( bondLength * Math.cos( 0 * angle ), bondLength * Math.sin( 0 * angle ), 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( bondLength * Math.cos( 1 * angle ), bondLength * Math.sin( 1 * angle ), 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( bondLength * Math.cos( 2 * angle ), bondLength * Math.sin( 2 * angle ), 0 ), 3 ), 1 );
  } );

  RealMoleculeShape.BROMINE_PENTAFLUORIDE = createMoleculeShape( 'BrF5', 1.774, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( B, new Vector3(), 1 ) );
    var axialBondLength = 1.689;
    var radialBondLength = 1.774;
    var angle = DotUtil.toRadians( 84.8 );
    var radialDistance = Math.sin( angle ) * radialBondLength;
    var axialDistance = Math.cos( angle ) * radialBondLength;
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, -axialBondLength, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( radialDistance, -axialDistance, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, -axialDistance, radialDistance ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( -radialDistance, -axialDistance, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, -axialDistance, -radialDistance ), 3 ), 1 );
  } );

  RealMoleculeShape.METHANE = createMoleculeShape( 'CH4', 1.087, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( C, new Vector3() ) );
    var bondLength = 1.087;
    var vectors = GeometryConfiguration.getConfiguration( 4 ).unitVectors;
    for ( var i = 0; i < vectors.length; i++ ) {
      shape.addRadialAtom( new RealAtomLocation( H, vectors[i].times( bondLength ), 0 ), 1 );
    }
  } );

  RealMoleculeShape.CHLORINE_TRIFLUORIDE = createMoleculeShape( 'ClF3', 1.698, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( Cl, new Vector3(), 2 ) );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, -1.598, 0 ), 3 ), 1 );
    var radialAngle = DotUtil.toRadians( 87.5 );
    var radialBondLength = 1.698;
    var radialDistance = Math.sin( radialAngle ) * radialBondLength;
    var axialDistance = Math.cos( radialAngle ) * radialBondLength;
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( radialDistance, -axialDistance, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( -radialDistance, -axialDistance, 0 ), 3 ), 1 );
  } );

  RealMoleculeShape.CARBON_DIOXIDE = createMoleculeShape( 'CO2', 1.163, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( C, new Vector3() ) );
    shape.addRadialAtom( new RealAtomLocation( O, new Vector3( -1.163, 0, 0 ), 2 ), 2 );
    shape.addRadialAtom( new RealAtomLocation( O, new Vector3( 1.163, 0, 0 ), 2 ), 2 );
  } );

  RealMoleculeShape.WATER = createMoleculeShape( 'H2O', 0.957, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( O, new Vector3(), 2 ) );
    var radialBondLength = 0.957;
    var radialAngle = DotUtil.toRadians( 104.5 ) / 2;
    shape.addRadialAtom( new RealAtomLocation( H, new Vector3( Math.sin( radialAngle ), -Math.cos( radialAngle ), 0 ).times( radialBondLength ) ), 1 );
    shape.addRadialAtom( new RealAtomLocation( H, new Vector3( -( Math.sin( radialAngle ) ), -Math.cos( radialAngle ), 0 ).times( radialBondLength ) ), 1 );
  } );

  RealMoleculeShape.AMMONIA = createMoleculeShape( 'NH3', 1.017, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( N, new Vector3(), 1 ) );
    var radialBondLength = 1.017;

    // to solve a 'axial' angle (from the axis of symmetry), Solve[Cos[\[Beta]] == Cos[\[Alpha]]^2*Cos[\[Theta]] + Sin[\[Alpha]]^2, \[Alpha]]  where beta is our given intra-bond angle, alpha is solved for, and theta = 2 pi / n where n is our number of bonds (3 in this case)
    var axialAngle = 1.202623030417028; // lots of precision, from Mathematica
    var radialAngle = 2 * Math.PI / 3;
    var radialDistance = Math.sin( axialAngle ) * radialBondLength;
    var axialDistance = Math.cos( axialAngle ) * radialBondLength;
    shape.addRadialAtom( new RealAtomLocation( H, new Vector3( radialDistance * Math.cos( 0 * radialAngle ), -axialDistance, radialDistance * Math.sin( 0 * radialAngle ) ) ), 1 );
    shape.addRadialAtom( new RealAtomLocation( H, new Vector3( radialDistance * Math.cos( 1 * radialAngle ), -axialDistance, radialDistance * Math.sin( 1 * radialAngle ) ) ), 1 );
    shape.addRadialAtom( new RealAtomLocation( H, new Vector3( radialDistance * Math.cos( 2 * radialAngle ), -axialDistance, radialDistance * Math.sin( 2 * radialAngle ) ) ), 1 );
  } );

  RealMoleculeShape.PHOSPHORUS_PENTACHLORIDE = createMoleculeShape( 'PCl5', 2.02, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( P, new Vector3() ) );
    shape.addRadialAtom( new RealAtomLocation( Cl, new Vector3( 2.14, 0, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( Cl, new Vector3( -2.14, 0, 0 ), 3 ), 1 );
    var radialAngle = 2 * Math.PI / 3;
    var radialBondLength = 2.02;
    shape.addRadialAtom( new RealAtomLocation( Cl, new Vector3( 0, Math.cos( 0 * radialAngle ), Math.sin( 0 * radialAngle ) ).times( radialBondLength ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( Cl, new Vector3( 0, Math.cos( 1 * radialAngle ), Math.sin( 1 * radialAngle ) ).times( radialBondLength ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( Cl, new Vector3( 0, Math.cos( 2 * radialAngle ), Math.sin( 2 * radialAngle ) ).times( radialBondLength ), 3 ), 1 );
  } );

  RealMoleculeShape.SULFUR_TETRAFLUORIDE = createMoleculeShape( 'SF4', 1.595, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( S, new Vector3(), 1 ) );
    var largeAngle = DotUtil.toRadians( 173.1 ) / 2;
    var smallAngle = DotUtil.toRadians( 101.6 ) / 2;

    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( Math.sin( largeAngle ), -Math.cos( largeAngle ), 0 ).times( 1.646 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( -Math.sin( largeAngle ), -Math.cos( largeAngle ), 0 ).times( 1.646 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, -Math.cos( smallAngle ), Math.sin( smallAngle ) ).times( 1.545 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, -Math.cos( smallAngle ), -Math.sin( smallAngle ) ).times( 1.545 ), 3 ), 1 );
  } );

  RealMoleculeShape.SULFUR_HEXAFLUORIDE = createMoleculeShape( 'SF6', 1.564, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( S, new Vector3() ) );
    var vectors = GeometryConfiguration.getConfiguration( 6 ).unitVectors;
    for ( var i = 0; i < vectors.length; i++ ) {
      shape.addRadialAtom( new RealAtomLocation( F, vectors[i].times( 1.564 ), 3 ), 1 );
    }
  } );

  RealMoleculeShape.SULFUR_DIOXIDE = createMoleculeShape( 'SO2', 1.431, function( shape ) {
    var bondAngle = DotUtil.toRadians( 119 ) / 2;
    var bondLength = 1.431;
    shape.addCentralAtom( new RealAtomLocation( S, new Vector3(), 1 ) );
    shape.addRadialAtom( new RealAtomLocation( O, new Vector3( Math.sin( bondAngle ), -Math.cos( bondAngle ), 0 ).times( bondLength ), 2 ), 2 );
    shape.addRadialAtom( new RealAtomLocation( O, new Vector3( -Math.sin( bondAngle ), -Math.cos( bondAngle ), 0 ).times( bondLength ), 2 ), 2 );
  } );

  RealMoleculeShape.XENON_DIFLUORIDE = createMoleculeShape( 'XeF2', 1.977, function( shape ) {
    shape.addCentralAtom( new RealAtomLocation( Xe, new Vector3(), 3 ) );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 1.977, 0, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( -1.977, 0, 0 ), 3 ), 1 );
  } );

  RealMoleculeShape.XENON_TETRAFLUORIDE = createMoleculeShape( 'XeF4', 1.953, function( shape ) {
    var bondLength = 1.953;
    shape.addCentralAtom( new RealAtomLocation( Xe, new Vector3(), 2 ) );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( bondLength, 0, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( -bondLength, 0, 0 ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, 0, bondLength ), 3 ), 1 );
    shape.addRadialAtom( new RealAtomLocation( F, new Vector3( 0, 0, -bondLength ), 3 ), 1 );
  } );

  RealMoleculeShape.TAB_2_BASIC_MOLECULES = [
    RealMoleculeShape.BERYLLIUM_CHLORIDE,
    RealMoleculeShape.BORON_TRIFLUORIDE,
    RealMoleculeShape.METHANE,
    RealMoleculeShape.PHOSPHORUS_PENTACHLORIDE,
    RealMoleculeShape.SULFUR_HEXAFLUORIDE
  ];

  RealMoleculeShape.TAB_2_MOLECULES = [
    // CO2, H2O, SO2, XeF2, BF3, ClF3, NH3, CH4, SF4, XeF4, BrF5, PCl5, SF6
    RealMoleculeShape.WATER,
    RealMoleculeShape.CARBON_DIOXIDE,
    RealMoleculeShape.SULFUR_DIOXIDE,
    RealMoleculeShape.XENON_DIFLUORIDE,
    RealMoleculeShape.BORON_TRIFLUORIDE,
    RealMoleculeShape.CHLORINE_TRIFLUORIDE,
    RealMoleculeShape.AMMONIA,
    RealMoleculeShape.METHANE,
    RealMoleculeShape.SULFUR_TETRAFLUORIDE,
    RealMoleculeShape.XENON_TETRAFLUORIDE,
    RealMoleculeShape.BROMINE_PENTAFLUORIDE,
    RealMoleculeShape.PHOSPHORUS_PENTACHLORIDE,
    RealMoleculeShape.SULFUR_HEXAFLUORIDE
  ];

  return RealMoleculeShape;
} );
