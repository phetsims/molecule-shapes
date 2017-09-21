// Copyright 2014-2017, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasWarningNode = require( 'SCENERY_PHET/CanvasWarningNode' );
  var GlobalOptionsNode = require( 'MOLECULE_SHAPES/common/view/GlobalOptionsNode' );
  var IE11StencilWarningNode = require( 'SCENERY_PHET/IE11StencilWarningNode' );
  var ModelMoleculesScreen = require( 'MOLECULE_SHAPES/model/ModelMoleculesScreen' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var RealMoleculesScreen = require( 'MOLECULE_SHAPES/real/RealMoleculesScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var moleculeShapesTitleString = require( 'string!MOLECULE_SHAPES/molecule-shapes.title' );

  var isBasicsVersion = false;

  var simOptions = {
    credits: {
      leadDesign: 'Emily B. Moore',
      softwareDevelopment: 'Jonathan Olson',
      team: 'Julia Chamberlain, Kelly Lancaster, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Oliver Orejola, Bryan Yoelin'
    },
    optionsNode: new GlobalOptionsNode( isBasicsVersion ),
    homeScreenWarningNode: MoleculeShapesGlobals.useWebGLProperty.get() ?
                           null :
                           ( MoleculeShapesGlobals.hasBasicWebGLSupportProperty.get() ?
                             new IE11StencilWarningNode() : // if we have basic support, we failed due to IE-specific reasons
                             new CanvasWarningNode() )
  };

  // NOTE: ?webgl=false will trigger Canvas rendering with a reduced poly-count

  MoleculeShapesGlobals.projectorColorsProperty.link( function( useProjectorColors ) {
    MoleculeShapesColorProfile.profileNameProperty.set( useProjectorColors ? 'projector' : 'default' );
  } );

  SimLauncher.launch( function() {
    var sim = new Sim( moleculeShapesTitleString, [
      new ModelMoleculesScreen( isBasicsVersion ),
      new RealMoleculesScreen( isBasicsVersion )
    ], simOptions );
    sim.start();
  } );
} );
