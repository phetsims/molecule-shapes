//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var ModelMoleculesScreen = require( 'MOLECULE_SHAPES/model/ModelMoleculesScreen' );
  var RealMoleculesScreen = require( 'MOLECULE_SHAPES/real/RealMoleculesScreen' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var GlobalOptionsNode = require( 'MOLECULE_SHAPES/common/view/GlobalOptionsNode' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!MOLECULE_SHAPES/molecule-shapes.name' );

  var isBasicsVersion = false;

  var simOptions = {
    credits: {
      leadDesign: 'Emily Moore',
      softwareDevelopment: 'Jonathan Olson',
      team: 'Emily Moore, Ariel Paul, Kathy Perkins, Kelly Lancaster, Julia Chamberlain',
      qualityAssurance: 'Bryan Yoelin, Oliver Orejola'
    },
    optionsNode: new GlobalOptionsNode( isBasicsVersion )
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  // NOTE: ?webgl=false will trigger Canvas rendering with a reduced poly-count

  MoleculeShapesGlobals.projectorColorsProperty.link( function( useProjectorColors ) {
    if ( useProjectorColors ) {
      MoleculeShapesColors.applyProfile( 'projector' );
    } else {
      MoleculeShapesColors.applyProfile( 'default' );
    }
  } );

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [
      new ModelMoleculesScreen( isBasicsVersion ),
      new RealMoleculesScreen( isBasicsVersion )
      ], simOptions );
    sim.start();
  } );
} );
