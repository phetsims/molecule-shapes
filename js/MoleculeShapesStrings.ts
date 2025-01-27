// Copyright 2021-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import moleculeShapes from './moleculeShapes.js';

type StringsType = {
  'molecule-shapes': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'modelStringProperty': LocalizedStringProperty;
    'realMoleculesStringProperty': LocalizedStringProperty;
  };
  'geometry': {
    'diatomicStringProperty': LocalizedStringProperty;
    'linearStringProperty': LocalizedStringProperty;
    'trigonalPlanarStringProperty': LocalizedStringProperty;
    'tetrahedralStringProperty': LocalizedStringProperty;
    'trigonalBipyramidalStringProperty': LocalizedStringProperty;
    'octahedralStringProperty': LocalizedStringProperty;
  };
  'shape': {
    'diatomicStringProperty': LocalizedStringProperty;
    'linearStringProperty': LocalizedStringProperty;
    'bentStringProperty': LocalizedStringProperty;
    'trigonalPlanarStringProperty': LocalizedStringProperty;
    'trigonalPyramidalStringProperty': LocalizedStringProperty;
    'tShapedStringProperty': LocalizedStringProperty;
    'tetrahedralStringProperty': LocalizedStringProperty;
    'seesawStringProperty': LocalizedStringProperty;
    'squarePlanarStringProperty': LocalizedStringProperty;
    'trigonalBipyramidalStringProperty': LocalizedStringProperty;
    'squarePyramidalStringProperty': LocalizedStringProperty;
    'octahedralStringProperty': LocalizedStringProperty;
  };
  'control': {
    'bondingStringProperty': LocalizedStringProperty;
    'lonePairStringProperty': LocalizedStringProperty;
    'optionsStringProperty': LocalizedStringProperty;
    'geometryNameStringProperty': LocalizedStringProperty;
    'moleculeGeometryStringProperty': LocalizedStringProperty;
    'electronGeometryStringProperty': LocalizedStringProperty;
    'showLonePairsStringProperty': LocalizedStringProperty;
    'showBondAnglesStringProperty': LocalizedStringProperty;
    'removeAllStringProperty': LocalizedStringProperty;
    'moleculeStringProperty': LocalizedStringProperty;
    'realViewStringProperty': LocalizedStringProperty;
    'modelViewStringProperty': LocalizedStringProperty;
  };
  'options': {
    'showOuterLonePairsStringProperty': LocalizedStringProperty;
    'projectorColorsStringProperty': LocalizedStringProperty;
  }
};

const MoleculeShapesStrings = getStringModule( 'MOLECULE_SHAPES' ) as StringsType;

moleculeShapes.register( 'MoleculeShapesStrings', MoleculeShapesStrings );

export default MoleculeShapesStrings;
