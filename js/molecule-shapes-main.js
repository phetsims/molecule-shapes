//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var ModelMoleculesScreen = require( 'MOLECULE_SHAPES/screens/model/ModelMoleculesScreen' );
  var RealMoleculesScreen = require( 'MOLECULE_SHAPES/screens/real/RealMoleculesScreen' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!MOLECULE_SHAPES/molecule-shapes.name' );

  var simOptions = {
    credits: {
      // TODO: fill in credits
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      thanks: ''
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  var isBasicsVersion = false;
  if ( window.phetcommon.getQueryParameter( 'basics' ) ) {
    isBasicsVersion = true;
    MoleculeShapesColors.applyProfile( 'basics' );
  }

  if ( window.phetcommon.getQueryParameter( 'projector' ) ) {
    MoleculeShapesColors.applyProfile( 'projector' );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [
      new ModelMoleculesScreen( isBasicsVersion ),
      new RealMoleculesScreen( isBasicsVersion )
      ], simOptions );
    sim.start();
  } );
} );