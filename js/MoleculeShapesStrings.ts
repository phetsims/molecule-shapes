// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import moleculeShapes from './moleculeShapes.js';

type StringsType = {
  'molecule-shapes': {
    'title': string;
    'titleStringProperty': TReadOnlyProperty<string>;
  };
  'screen': {
    'model': string;
    'modelStringProperty': TReadOnlyProperty<string>;
    'realMolecules': string;
    'realMoleculesStringProperty': TReadOnlyProperty<string>;
  };
  'geometry': {
    'diatomic': string;
    'diatomicStringProperty': TReadOnlyProperty<string>;
    'linear': string;
    'linearStringProperty': TReadOnlyProperty<string>;
    'trigonalPlanar': string;
    'trigonalPlanarStringProperty': TReadOnlyProperty<string>;
    'tetrahedral': string;
    'tetrahedralStringProperty': TReadOnlyProperty<string>;
    'trigonalBipyramidal': string;
    'trigonalBipyramidalStringProperty': TReadOnlyProperty<string>;
    'octahedral': string;
    'octahedralStringProperty': TReadOnlyProperty<string>;
  };
  'shape': {
    'diatomic': string;
    'diatomicStringProperty': TReadOnlyProperty<string>;
    'linear': string;
    'linearStringProperty': TReadOnlyProperty<string>;
    'bent': string;
    'bentStringProperty': TReadOnlyProperty<string>;
    'trigonalPlanar': string;
    'trigonalPlanarStringProperty': TReadOnlyProperty<string>;
    'trigonalPyramidal': string;
    'trigonalPyramidalStringProperty': TReadOnlyProperty<string>;
    'tShaped': string;
    'tShapedStringProperty': TReadOnlyProperty<string>;
    'tetrahedral': string;
    'tetrahedralStringProperty': TReadOnlyProperty<string>;
    'seesaw': string;
    'seesawStringProperty': TReadOnlyProperty<string>;
    'squarePlanar': string;
    'squarePlanarStringProperty': TReadOnlyProperty<string>;
    'trigonalBipyramidal': string;
    'trigonalBipyramidalStringProperty': TReadOnlyProperty<string>;
    'squarePyramidal': string;
    'squarePyramidalStringProperty': TReadOnlyProperty<string>;
    'octahedral': string;
    'octahedralStringProperty': TReadOnlyProperty<string>;
  };
  'control': {
    'bonding': string;
    'bondingStringProperty': TReadOnlyProperty<string>;
    'lonePair': string;
    'lonePairStringProperty': TReadOnlyProperty<string>;
    'options': string;
    'optionsStringProperty': TReadOnlyProperty<string>;
    'geometryName': string;
    'geometryNameStringProperty': TReadOnlyProperty<string>;
    'moleculeGeometry': string;
    'moleculeGeometryStringProperty': TReadOnlyProperty<string>;
    'electronGeometry': string;
    'electronGeometryStringProperty': TReadOnlyProperty<string>;
    'showLonePairs': string;
    'showLonePairsStringProperty': TReadOnlyProperty<string>;
    'showBondAngles': string;
    'showBondAnglesStringProperty': TReadOnlyProperty<string>;
    'removeAll': string;
    'removeAllStringProperty': TReadOnlyProperty<string>;
    'molecule': string;
    'moleculeStringProperty': TReadOnlyProperty<string>;
    'realView': string;
    'realViewStringProperty': TReadOnlyProperty<string>;
    'modelView': string;
    'modelViewStringProperty': TReadOnlyProperty<string>;
  };
  'options': {
    'showOuterLonePairs': string;
    'showOuterLonePairsStringProperty': TReadOnlyProperty<string>;
    'projectorColors': string;
    'projectorColorsStringProperty': TReadOnlyProperty<string>;
  }
};

const moleculeShapesStrings = getStringModule( 'MOLECULE_SHAPES' ) as StringsType;

moleculeShapes.register( 'moleculeShapesStrings', moleculeShapesStrings );

export default moleculeShapesStrings;
