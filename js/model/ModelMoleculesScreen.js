// Copyright 2014-2015, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var ModelMoleculesModel = require( 'MOLECULE_SHAPES/model/ModelMoleculesModel' );
  var ModelMoleculesScreenView = require( 'MOLECULE_SHAPES/model/ModelMoleculesScreenView' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var ScreenIconNode = require( 'MOLECULE_SHAPES/common/view/ScreenIconNode' );

  // strings
  var screenModelString = require( 'string!MOLECULE_SHAPES/screen.model' );

  /**
   * Creates the model and view for the ModelMoleculesScreen
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function ModelMoleculesScreen( isBasicsVersion ) {

    var screen = this;

    var options = {
      name: screenModelString,
      backgroundColor: MoleculeShapesColors.background.toCSS(),
      homeScreenIcon: new ScreenIconNode( true, isBasicsVersion )
    };

    Screen.call( this,
      function() { return new ModelMoleculesModel( isBasicsVersion ); },
      function( model ) { return new ModelMoleculesScreenView( model ); },
      options
    );

    MoleculeShapesColors.link( 'background', function( color ) {
      screen.backgroundColor = color;
    } );
  }

  moleculeShapes.register( 'ModelMoleculesScreen', ModelMoleculesScreen );

  return inherit( Screen, ModelMoleculesScreen );
} );
