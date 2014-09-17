//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var ModelMoleculesModel = require( 'MOLECULE_SHAPES/screens/model/ModelMoleculesModel' );
  var ModelMoleculesScreenView = require( 'MOLECULE_SHAPES/screens/model/ModelMoleculesScreenView' );

  // strings
  var screenTitle = require( 'string!MOLECULE_SHAPES/molecule-shapes.title' );

  /**
   * Creates the model and view for the ModelMoleculesScreen
   * @constructor
   */
  return inherit( Screen, function ModelMoleculesScreen() {
    var screenIcon = Rectangle.rect( 0, 0, Screen.HOME_SCREEN_ICON_SIZE.width, Screen.HOME_SCREEN_ICON_SIZE.height, {
      fill: 'red'
    } );

    Screen.call( this, screenTitle, screenIcon,
      function() { return new ModelMoleculesModel(); },
      function( model ) { return new ModelMoleculesScreenView( model ); },
      { backgroundColor: '#000' }
    );
  } );
} );
