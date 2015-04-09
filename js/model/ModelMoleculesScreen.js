// Copyright 2002-2014, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var ModelMoleculesModel = require( 'MOLECULE_SHAPES/model/ModelMoleculesModel' );
  var ModelMoleculesScreenView = require( 'MOLECULE_SHAPES/model/ModelMoleculesScreenView' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var ScreenIconNode = require( 'MOLECULE_SHAPES/common/view/ScreenIconNode' );

  // strings
  var screenTitle = require( 'string!MOLECULE_SHAPES/molecule-shapes.title' );

  /**
   * Creates the model and view for the ModelMoleculesScreen
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function ModelMoleculesScreen( isBasicsVersion ) {
    var screen = this;

    var screenIcon = new ScreenIconNode( true, isBasicsVersion );

    Screen.call( this, screenTitle, screenIcon,
      function() { return new ModelMoleculesModel( isBasicsVersion ); },
      function( model ) { return new ModelMoleculesScreenView( model ); },
      { backgroundColor: MoleculeShapesColors.background.toCSS() }
    );

    MoleculeShapesColors.link( 'background', function( color ) {
      screen.backgroundColor = color;
    } );
  }

  return inherit( Screen, ModelMoleculesScreen );
} );
