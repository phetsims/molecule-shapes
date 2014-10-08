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
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/view/MoleculeShapesGlobals' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!MOLECULE_SHAPES/molecule-shapes.name' );
  var showOuterLonePairsString = require( 'string!MOLECULE_SHAPES/options.showOuterLonePairs' );
  var projectorColorsString = require( 'string!MOLECULE_SHAPES/options.projectorColors' );

  var simOptions = {
    credits: {
      // TODO: fill in credits
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      thanks: ''
    },
    globalOptions: [
      {
        label: showOuterLonePairsString,
        type: 'boolean',
        property: MoleculeShapesGlobals.showOuterLonePairsProperty
      },
      {
        label: projectorColorsString,
        type: 'boolean',
        property: MoleculeShapesGlobals.projectorColorsProperty
      }
    ]
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( window.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  // NOTE: ?canvasOnly will trigger Canvas rendering with a reduced poly-count

  var isBasicsVersion = false;

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
