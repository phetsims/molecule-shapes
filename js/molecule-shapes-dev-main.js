//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Development testing entry point
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  return {
    // TODO: update
    RealAtomLocation: require( 'MOLECULE_SHAPES/common/model/RealAtomLocation' ),
    AttractorModel: require( 'MOLECULE_SHAPES/common/model/AttractorModel' ),
    Bond: require( 'MOLECULE_SHAPES/common/model/Bond' ),
    FastMath: require( 'MOLECULE_SHAPES/common/model/FastMath' ),
    GeometryConfiguration: require( 'MOLECULE_SHAPES/common/model/GeometryConfiguration' ),
    LocalShape: require( 'MOLECULE_SHAPES/common/model/LocalShape' ),
    Molecule: require( 'MOLECULE_SHAPES/common/model/Molecule' ),
    PairGroup: require( 'MOLECULE_SHAPES/common/model/PairGroup' ),
    RealMolecule: require( 'MOLECULE_SHAPES/common/model/RealMolecule' ),
    RealMoleculeShape: require( 'MOLECULE_SHAPES/common/model/RealMoleculeShape' ),
    VseprConfiguration: require( 'MOLECULE_SHAPES/common/model/VseprConfiguration' ),
    VSEPRMolecule: require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' ),

    ModelMoleculesModel: require( 'MOLECULE_SHAPES/model/ModelMoleculesModel' ),
    ModelMoleculesScreen: require( 'MOLECULE_SHAPES/model/ModelMoleculesScreen' ),
    ModelMoleculesScreenView: require( 'MOLECULE_SHAPES/model/ModelMoleculesScreenView' ),

    RealMoleculesModel: require( 'MOLECULE_SHAPES/real/RealMoleculesModel' ),
    RealMoleculesScreen: require( 'MOLECULE_SHAPES/real/RealMoleculesScreen' ),
    RealMoleculesScreenView: require( 'MOLECULE_SHAPES/real/RealMoleculesScreenView' ),


    AtomView: require( 'MOLECULE_SHAPES/common/view/3d/AtomView' ),
    BondView: require( 'MOLECULE_SHAPES/common/view/3d/BondView' ),
    MoleculeView: require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' ),

    MoleculeShapesColors: require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' ),
    MoleculeShapesScreenView: require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' ),

    // externals used for debugging
    Element: require( 'NITROGLYCERIN/Element' )
  };
} );
