// Copyright 2014-2015, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var RealMoleculesModel = require( 'MOLECULE_SHAPES/real/RealMoleculesModel' );
  var RealMoleculesScreenView = require( 'MOLECULE_SHAPES/real/RealMoleculesScreenView' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var ScreenIconNode = require( 'MOLECULE_SHAPES/common/view/ScreenIconNode' );

  // strings
  var screenRealMoleculesString = require( 'string!MOLECULE_SHAPES/screen.realMolecules' );

  /**
   * Creates the model and view for the RealMoleculesScreen
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function RealMoleculesScreen( isBasicsVersion ) {

    var self = this;

    var options = {
      name: screenRealMoleculesString,
      backgroundColor: MoleculeShapesColorProfile.backgroundProperty.get().toCSS(),
      homeScreenIcon: new ScreenIconNode( false, isBasicsVersion )
    };

    Screen.call( this,
      function() { return new RealMoleculesModel( isBasicsVersion ); },
      function( model ) { return new RealMoleculesScreenView( model ); },
      options
    );

    MoleculeShapesColorProfile.backgroundProperty.link( function( color ) {
      self.backgroundColorProperty.value = color;
    } );
  }

  moleculeShapes.register( 'RealMoleculesScreen', RealMoleculesScreen );

  return inherit( Screen, RealMoleculesScreen );
} );
