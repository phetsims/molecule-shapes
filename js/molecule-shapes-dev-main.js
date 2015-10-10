// Copyright 2002-2014, University of Colorado Boulder

/**
 * Development testing entry point
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  return {
    LonePairGeometryData: require( 'MOLECULE_SHAPES/common/data/LonePairGeometryData' ),

    AttractorModel: require( 'MOLECULE_SHAPES/common/model/AttractorModel' ),
    Bond: require( 'MOLECULE_SHAPES/common/model/Bond' ),
    FastMath: require( 'DOT/MatrixOps3' ),
    GeometryConfiguration: require( 'MOLECULE_SHAPES/common/model/GeometryConfiguration' ),
    LocalShape: require( 'MOLECULE_SHAPES/common/model/LocalShape' ),
    Molecule: require( 'MOLECULE_SHAPES/common/model/Molecule' ),
    MoleculeShapesModel: require( 'MOLECULE_SHAPES/common/model/MoleculeShapesModel' ),
    PairGroup: require( 'MOLECULE_SHAPES/common/model/PairGroup' ),
    RealAtomLocation: require( 'MOLECULE_SHAPES/common/model/RealAtomLocation' ),
    RealMolecule: require( 'MOLECULE_SHAPES/common/model/RealMolecule' ),
    RealMoleculeShape: require( 'MOLECULE_SHAPES/common/model/RealMoleculeShape' ),
    VSEPRConfiguration: require( 'MOLECULE_SHAPES/common/model/VSEPRConfiguration' ),
    VSEPRMolecule: require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' ),

    AtomView: require( 'MOLECULE_SHAPES/common/view/3d/AtomView' ),
    BondAngleFallbackView: require( 'MOLECULE_SHAPES/common/view/3d/BondAngleFallbackView' ),
    BondAngleView: require( 'MOLECULE_SHAPES/common/view/3d/BondAngleView' ),
    BondAngleWebGLView: require( 'MOLECULE_SHAPES/common/view/3d/BondAngleWebGLView' ),
    BondView: require( 'MOLECULE_SHAPES/common/view/3d/BondView' ),
    ElectronView: require( 'MOLECULE_SHAPES/common/view/3d/ElectronView' ),
    LabelWebGLView: require( 'MOLECULE_SHAPES/common/view/3d/LabelWebGLView' ),
    LocalGeometry: require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' ),
    LocalMaterial: require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' ),
    LocalPool: require( 'MOLECULE_SHAPES/common/view/3d/LocalPool' ),
    LocalTexture: require( 'MOLECULE_SHAPES/common/view/3d/LocalTexture' ),
    LonePairView: require( 'MOLECULE_SHAPES/common/view/3d/LonePairView' ),
    MoleculeView: require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' ),

    GeometryNamePanel: require( 'MOLECULE_SHAPES/common/view/GeometryNamePanel' ),
    GlobalOptionsNode: require( 'MOLECULE_SHAPES/common/view/GlobalOptionsNode' ),
    LabelFallbackNode: require( 'MOLECULE_SHAPES/common/view/LabelFallbackNode' ),
    MoleculeShapesCheckBox: require( 'MOLECULE_SHAPES/common/view/MoleculeShapesCheckBox' ),
    MoleculeShapesColors: require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' ),
    MoleculeShapesPanel: require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' ),
    MoleculeShapesScreenView: require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' ),
    OptionsNode: require( 'MOLECULE_SHAPES/common/view/OptionsNode' ),
    TitledPanel: require( 'MOLECULE_SHAPES/common/view/TitledPanel' ),

    MoleculeShapesGlobals: require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' ),

    BondGroupNode: require( 'MOLECULE_SHAPES/model/BondGroupNode' ),
    ModelMoleculesModel: require( 'MOLECULE_SHAPES/model/ModelMoleculesModel' ),
    ModelMoleculesScreen: require( 'MOLECULE_SHAPES/model/ModelMoleculesScreen' ),
    ModelMoleculesScreenView: require( 'MOLECULE_SHAPES/model/ModelMoleculesScreenView' ),
    RemovePairGroupButton: require( 'MOLECULE_SHAPES/model/RemovePairGroupButton' ),

    RealMoleculesModel: require( 'MOLECULE_SHAPES/real/RealMoleculesModel' ),
    RealMoleculesScreen: require( 'MOLECULE_SHAPES/real/RealMoleculesScreen' ),
    RealMoleculesScreenView: require( 'MOLECULE_SHAPES/real/RealMoleculesScreenView' ),

    // externals used for debugging
    Element: require( 'NITROGLYCERIN/Element' )
  };
} );
