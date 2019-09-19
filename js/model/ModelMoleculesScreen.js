// Copyright 2014-2017, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const ModelMoleculesModel = require( 'MOLECULE_SHAPES/model/ModelMoleculesModel' );
  const ModelMoleculesScreenView = require( 'MOLECULE_SHAPES/model/ModelMoleculesScreenView' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const Screen = require( 'JOIST/Screen' );
  const ScreenIconNode = require( 'MOLECULE_SHAPES/common/view/ScreenIconNode' );

  // strings
  const screenModelString = require( 'string!MOLECULE_SHAPES/screen.model' );

  /**
   * Creates the model and view for the ModelMoleculesScreen
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function ModelMoleculesScreen( isBasicsVersion ) {
    var options = {
      name: screenModelString,
      backgroundColorProperty: MoleculeShapesColorProfile.backgroundProperty,
      homeScreenIcon: new ScreenIconNode( true, isBasicsVersion )
    };

    Screen.call( this,
      function() { return new ModelMoleculesModel( isBasicsVersion ); },
      function( model ) { return new ModelMoleculesScreenView( model ); },
      options
    );
  }

  moleculeShapes.register( 'ModelMoleculesScreen', ModelMoleculesScreen );

  return inherit( Screen, ModelMoleculesScreen );
} );
