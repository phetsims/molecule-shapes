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
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!MOLECULE_SHAPES/molecule-shapes.name' );

  var simOptions = {
    credits: {

      // all credits fields are optional
      // TODO: while I like the credits here, we should probably fill this out
      leadDesign: 'Groucho',
      softwareDevelopment: 'Harpo',
      designTeam: 'Curly, Larry, Mo',
      interviews: 'Wile E. Coyote',
      thanks: 'Thanks to the ACME Dynamite Company for funding this sim!'
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new ModelMoleculesScreen(), new RealMoleculesScreen() ], simOptions );
    sim.start();
  } );
} );
