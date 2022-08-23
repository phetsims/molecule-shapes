// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import CanvasWarningNode from '../../scenery-phet/js/CanvasWarningNode.js';
import Tandem from '../../tandem/js/Tandem.js';
import MoleculeShapesGlobals from './common/MoleculeShapesGlobals.js';
import GlobalOptionsNode from './common/view/GlobalOptionsNode.js';
import ModelMoleculesScreen from './model/ModelMoleculesScreen.js';
import moleculeShapesStrings from './moleculeShapesStrings.js';
import RealMoleculesScreen from './real/RealMoleculesScreen.js';

const isBasicsVersion = false;

const simOptions = {
  credits: {
    leadDesign: 'Emily B. Moore',
    softwareDevelopment: 'Jonathan Olson',
    team: 'Julia Chamberlain, Kelly Lancaster, Ariel Paul, Kathy Perkins, Amy Rouinfar',
    qualityAssurance: 'Steele Dalton, Bryce Griebenow, Clifford Hardin, Brooklyn Lash, Emily Miller, Elise Morgan, Oliver Orejola, Jacob Romero, Nancy Salpepi, Kathryn Woessner, Bryan Yoelin'
  },
  webgl: true,
  preferencesModel: new PreferencesModel( {
    generalOptions: {
      customPreferences: [ {
        createContent: tandem => new GlobalOptionsNode( isBasicsVersion, tandem )
      } ]
    }
  } ),

  homeScreenWarningNode: MoleculeShapesGlobals.useWebGLProperty.value ? null : new CanvasWarningNode()
};

// NOTE: ?webgl=false will trigger Canvas rendering with a reduced poly-count

simLauncher.launch( () => {
  const sim = new Sim( moleculeShapesStrings[ 'molecule-shapes' ].titleProperty, [
    new ModelMoleculesScreen( isBasicsVersion, Tandem.ROOT.createTandem( 'modelScreen' ) ),
    new RealMoleculesScreen( isBasicsVersion, Tandem.ROOT.createTandem( 'realMoleculesScreen' ) )
  ], simOptions );
  sim.start();
} );
