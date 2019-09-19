// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const CanvasWarningNode = require( 'SCENERY_PHET/CanvasWarningNode' );
  const GlobalOptionsNode = require( 'MOLECULE_SHAPES/common/view/GlobalOptionsNode' );
  const IE11StencilWarningNode = require( 'SCENERY_PHET/IE11StencilWarningNode' );
  const ModelMoleculesScreen = require( 'MOLECULE_SHAPES/model/ModelMoleculesScreen' );
  const MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  const RealMoleculesScreen = require( 'MOLECULE_SHAPES/real/RealMoleculesScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  const moleculeShapesTitleString = require( 'string!MOLECULE_SHAPES/molecule-shapes.title' );

  var isBasicsVersion = false;

  var simOptions = {
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
    var sim = new Sim( moleculeShapesTitleString, [
      new ModelMoleculesScreen( isBasicsVersion ),
      new RealMoleculesScreen( isBasicsVersion )
    ], simOptions );
    sim.start();
  } );
} );
