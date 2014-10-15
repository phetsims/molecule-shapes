//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var RealMoleculesModel = require( 'MOLECULE_SHAPES/real/RealMoleculesModel' );
  var RealMoleculesScreenView = require( 'MOLECULE_SHAPES/real/RealMoleculesScreenView' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );

  // strings
  var screenTitle = require( 'string!MOLECULE_SHAPES/real-molecules' );

  /**
   * Creates the model and view for the RealMoleculesScreen
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  return inherit( Screen, function RealMoleculesScreen( isBasicsVersion ) {
    var screen = this;

    var screenIcon = Rectangle.rect( 0, 0, Screen.HOME_SCREEN_ICON_SIZE.width, Screen.HOME_SCREEN_ICON_SIZE.height, {
      fill: 'blue'
    } );

    Screen.call( this, screenTitle, screenIcon,
      function() { return new RealMoleculesModel( isBasicsVersion ); },
      function( model ) { return new RealMoleculesScreenView( model ); },
      { backgroundColor: MoleculeShapesColors.background.toCSS() }
    );

    MoleculeShapesColors.link( 'background', function( color ) {
      screen.backgroundColor = color;
    } );
  } );
} );
