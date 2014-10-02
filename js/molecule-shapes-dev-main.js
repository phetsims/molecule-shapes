//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Development testing entry point
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  return {
    Atom: require( 'MOLECULE_SHAPES/model/Atom' ),
    AttractorModel: require( 'MOLECULE_SHAPES/model/AttractorModel' ),
    Bond: require( 'MOLECULE_SHAPES/model/Bond' ),
    GeometryConfiguration: require( 'MOLECULE_SHAPES/model/GeometryConfiguration' ),
    LocalShape: require( 'MOLECULE_SHAPES/model/LocalShape' ),
    Molecule: require( 'MOLECULE_SHAPES/model/Molecule' ),
    PairGroup: require( 'MOLECULE_SHAPES/model/PairGroup' ),
    RealMolecule: require( 'MOLECULE_SHAPES/model/RealMolecule' ),
    RealMoleculeShape: require( 'MOLECULE_SHAPES/model/RealMoleculeShape' ),
    VseprConfiguration: require( 'MOLECULE_SHAPES/model/VseprConfiguration' ),
    VSEPRMolecule: require( 'MOLECULE_SHAPES/model/VSEPRMolecule' ),

    ModelMoleculesModel: require( 'MOLECULE_SHAPES/screens/model/ModelMoleculesModel' ),
    ModelMoleculesScreen: require( 'MOLECULE_SHAPES/screens/model/ModelMoleculesScreen' ),
    ModelMoleculesScreenView: require( 'MOLECULE_SHAPES/screens/model/ModelMoleculesScreenView' ),

    RealMoleculesModel: require( 'MOLECULE_SHAPES/screens/real/RealMoleculesModel' ),
    RealMoleculesScreen: require( 'MOLECULE_SHAPES/screens/real/RealMoleculesScreen' ),
    RealMoleculesScreenView: require( 'MOLECULE_SHAPES/screens/real/RealMoleculesScreenView' ),


    AtomView: require( 'MOLECULE_SHAPES/view/3d/AtomView' ),
    BondView: require( 'MOLECULE_SHAPES/view/3d/BondView' ),
    MoleculeView: require( 'MOLECULE_SHAPES/view/3d/MoleculeView' ),

    MoleculeShapesColors: require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' ),
    MoleculeShapesScreenView: require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' ),

    // externals used for debugging
    Element: require( 'NITROGLYCERIN/Element' )
  };
} );
