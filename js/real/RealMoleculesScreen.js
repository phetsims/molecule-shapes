// Copyright 2014-2017, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const RealMoleculesModel = require( 'MOLECULE_SHAPES/real/RealMoleculesModel' );
  const RealMoleculesScreenView = require( 'MOLECULE_SHAPES/real/RealMoleculesScreenView' );
  const Screen = require( 'JOIST/Screen' );
  const ScreenIconNode = require( 'MOLECULE_SHAPES/common/view/ScreenIconNode' );

  // strings
  const screenRealMoleculesString = require( 'string!MOLECULE_SHAPES/screen.realMolecules' );

  /**
   * Creates the model and view for the RealMoleculesScreen
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function RealMoleculesScreen( isBasicsVersion ) {
    const options = {
      name: screenRealMoleculesString,
      backgroundColorProperty: MoleculeShapesColorProfile.backgroundProperty,
      homeScreenIcon: new ScreenIconNode( false, isBasicsVersion )
    };

    Screen.call( this,
      function() { return new RealMoleculesModel( isBasicsVersion ); },
      function( model ) { return new RealMoleculesScreenView( model ); },
      options
    );
  }

  moleculeShapes.register( 'RealMoleculesScreen', RealMoleculesScreen );

  return inherit( Screen, RealMoleculesScreen );
} );
