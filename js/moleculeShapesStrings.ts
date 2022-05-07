// Copyright 2021, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import moleculeShapes from './moleculeShapes.js';

type StringsType = {
  'molecule-shapes': {
    'title': string;
  };
  'screen': {
    'model': string;
    'realMolecules': string;
  };
  'geometry': {
    'diatomic': string;
    'linear': string;
    'trigonalPlanar': string;
    'tetrahedral': string;
    'trigonalBipyramidal': string;
    'octahedral': string;
  };
  'shape': {
    'diatomic': string;
    'linear': string;
    'bent': string;
    'trigonalPlanar': string;
    'trigonalPyramidal': string;
    'tShaped': string;
    'tetrahedral': string;
    'seesaw': string;
    'squarePlanar': string;
    'trigonalBipyramidal': string;
    'squarePyramidal': string;
    'octahedral': string;
  };
  'control': {
    'bonding': string;
    'lonePair': string;
    'options': string;
    'geometryName': string;
    'moleculeGeometry': string;
    'electronGeometry': string;
    'showLonePairs': string;
    'showBondAngles': string;
    'removeAll': string;
    'molecule': string;
    'realView': string;
    'modelView': string;
  };
  'options': {
    'showOuterLonePairs': string;
    'projectorColors': string;
  }
};

const moleculeShapesStrings = getStringModule( 'MOLECULE_SHAPES' ) as StringsType;

moleculeShapes.register( 'moleculeShapesStrings', moleculeShapesStrings );

export default moleculeShapesStrings;
