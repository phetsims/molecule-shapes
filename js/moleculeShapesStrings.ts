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
    'titleProperty': TReadOnlyProperty<string>;
  };
  'screen': {
    'model': string;
    'modelProperty': TReadOnlyProperty<string>;
    'realMolecules': string;
    'realMoleculesProperty': TReadOnlyProperty<string>;
  };
  'geometry': {
    'diatomic': string;
    'diatomicProperty': TReadOnlyProperty<string>;
    'linear': string;
    'linearProperty': TReadOnlyProperty<string>;
    'trigonalPlanar': string;
    'trigonalPlanarProperty': TReadOnlyProperty<string>;
    'tetrahedral': string;
    'tetrahedralProperty': TReadOnlyProperty<string>;
    'trigonalBipyramidal': string;
    'trigonalBipyramidalProperty': TReadOnlyProperty<string>;
    'octahedral': string;
    'octahedralProperty': TReadOnlyProperty<string>;
  };
  'shape': {
    'diatomic': string;
    'diatomicProperty': TReadOnlyProperty<string>;
    'linear': string;
    'linearProperty': TReadOnlyProperty<string>;
    'bent': string;
    'bentProperty': TReadOnlyProperty<string>;
    'trigonalPlanar': string;
    'trigonalPlanarProperty': TReadOnlyProperty<string>;
    'trigonalPyramidal': string;
    'trigonalPyramidalProperty': TReadOnlyProperty<string>;
    'tShaped': string;
    'tShapedProperty': TReadOnlyProperty<string>;
    'tetrahedral': string;
    'tetrahedralProperty': TReadOnlyProperty<string>;
    'seesaw': string;
    'seesawProperty': TReadOnlyProperty<string>;
    'squarePlanar': string;
    'squarePlanarProperty': TReadOnlyProperty<string>;
    'trigonalBipyramidal': string;
    'trigonalBipyramidalProperty': TReadOnlyProperty<string>;
    'squarePyramidal': string;
    'squarePyramidalProperty': TReadOnlyProperty<string>;
    'octahedral': string;
    'octahedralProperty': TReadOnlyProperty<string>;
  };
  'control': {
    'bonding': string;
    'bondingProperty': TReadOnlyProperty<string>;
    'lonePair': string;
    'lonePairProperty': TReadOnlyProperty<string>;
    'options': string;
    'optionsProperty': TReadOnlyProperty<string>;
    'geometryName': string;
    'geometryNameProperty': TReadOnlyProperty<string>;
    'moleculeGeometry': string;
    'moleculeGeometryProperty': TReadOnlyProperty<string>;
    'electronGeometry': string;
    'electronGeometryProperty': TReadOnlyProperty<string>;
    'showLonePairs': string;
    'showLonePairsProperty': TReadOnlyProperty<string>;
    'showBondAngles': string;
    'showBondAnglesProperty': TReadOnlyProperty<string>;
    'removeAll': string;
    'removeAllProperty': TReadOnlyProperty<string>;
    'molecule': string;
    'moleculeProperty': TReadOnlyProperty<string>;
    'realView': string;
    'realViewProperty': TReadOnlyProperty<string>;
    'modelView': string;
    'modelViewProperty': TReadOnlyProperty<string>;
  };
  'options': {
    'showOuterLonePairs': string;
    'showOuterLonePairsProperty': TReadOnlyProperty<string>;
    'projectorColors': string;
    'projectorColorsProperty': TReadOnlyProperty<string>;
  }
};

const moleculeShapesStrings = getStringModule( 'MOLECULE_SHAPES' ) as StringsType;

moleculeShapes.register( 'moleculeShapesStrings', moleculeShapesStrings );

export default moleculeShapesStrings;
