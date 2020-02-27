// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import CanvasWarningNode from '../../scenery-phet/js/CanvasWarningNode.js';
import IE11StencilWarningNode from '../../scenery-phet/js/IE11StencilWarningNode.js';
import MoleculeShapesGlobals from './common/MoleculeShapesGlobals.js';
import GlobalOptionsNode from './common/view/GlobalOptionsNode.js';
import ModelMoleculesScreen from './model/ModelMoleculesScreen.js';
import moleculeShapesStrings from './molecule-shapes-strings.js';
import RealMoleculesScreen from './real/RealMoleculesScreen.js';

const moleculeShapesTitleString = moleculeShapesStrings[ 'molecule-shapes' ].title;

const isBasicsVersion = false;

const simOptions = {
  credits: {
    leadDesign: 'Emily B. Moore',
    softwareDevelopment: 'Jonathan Olson',
    team: 'Julia Chamberlain, Kelly Lancaster, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Oliver Orejola, Bryan Yoelin'
  },
  webgl: true,

  // Creates content for the Options dialog
  createOptionsDialogContent: () => new GlobalOptionsNode( isBasicsVersion ),

  homeScreenWarningNode: MoleculeShapesGlobals.useWebGLProperty.get() ?
                         null :
                         ( MoleculeShapesGlobals.hasBasicWebGLSupportProperty.get() ?
                           new IE11StencilWarningNode() : // if we have basic support, we failed due to IE-specific reasons
                           new CanvasWarningNode() )
};

// NOTE: ?webgl=false will trigger Canvas rendering with a reduced poly-count

SimLauncher.launch( function() {
  const sim = new Sim( moleculeShapesTitleString, [
    new ModelMoleculesScreen( isBasicsVersion ),
    new RealMoleculesScreen( isBasicsVersion )
  ], simOptions );
  sim.start();
} );