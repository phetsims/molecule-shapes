// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import Property from '../../axon/js/Property.js';
import moleculeShapes from './moleculeShapes.js';

type StringsType = {
  'molecule-shapes': {
    'title': string;
    'titleProperty': Property<string>;
  };
  'screen': {
    'model': string;
    'modelProperty': Property<string>;
    'realMolecules': string;
    'realMoleculesProperty': Property<string>;
  };
  'geometry': {
    'diatomic': string;
    'diatomicProperty': Property<string>;
    'linear': string;
    'linearProperty': Property<string>;
    'trigonalPlanar': string;
    'trigonalPlanarProperty': Property<string>;
    'tetrahedral': string;
    'tetrahedralProperty': Property<string>;
    'trigonalBipyramidal': string;
    'trigonalBipyramidalProperty': Property<string>;
    'octahedral': string;
    'octahedralProperty': Property<string>;
  };
  'shape': {
    'diatomic': string;
    'diatomicProperty': Property<string>;
    'linear': string;
    'linearProperty': Property<string>;
    'bent': string;
    'bentProperty': Property<string>;
    'trigonalPlanar': string;
    'trigonalPlanarProperty': Property<string>;
    'trigonalPyramidal': string;
    'trigonalPyramidalProperty': Property<string>;
    'tShaped': string;
    'tShapedProperty': Property<string>;
    'tetrahedral': string;
    'tetrahedralProperty': Property<string>;
    'seesaw': string;
    'seesawProperty': Property<string>;
    'squarePlanar': string;
    'squarePlanarProperty': Property<string>;
    'trigonalBipyramidal': string;
    'trigonalBipyramidalProperty': Property<string>;
    'squarePyramidal': string;
    'squarePyramidalProperty': Property<string>;
    'octahedral': string;
    'octahedralProperty': Property<string>;
  };
  'control': {
    'bonding': string;
    'bondingProperty': Property<string>;
    'lonePair': string;
    'lonePairProperty': Property<string>;
    'options': string;
    'optionsProperty': Property<string>;
    'geometryName': string;
    'geometryNameProperty': Property<string>;
    'moleculeGeometry': string;
    'moleculeGeometryProperty': Property<string>;
    'electronGeometry': string;
    'electronGeometryProperty': Property<string>;
    'showLonePairs': string;
    'showLonePairsProperty': Property<string>;
    'showBondAngles': string;
    'showBondAnglesProperty': Property<string>;
    'removeAll': string;
    'removeAllProperty': Property<string>;
    'molecule': string;
    'moleculeProperty': Property<string>;
    'realView': string;
    'realViewProperty': Property<string>;
    'modelView': string;
    'modelViewProperty': Property<string>;
  };
  'options': {
    'showOuterLonePairs': string;
    'showOuterLonePairsProperty': Property<string>;
    'projectorColors': string;
    'projectorColorsProperty': Property<string>;
  }
};

const moleculeShapesStrings = getStringModule( 'MOLECULE_SHAPES' ) as StringsType;

moleculeShapes.register( 'moleculeShapesStrings', moleculeShapesStrings );

export default moleculeShapesStrings;
