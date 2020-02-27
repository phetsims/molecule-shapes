// Copyright 2014-2019, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import MoleculeShapesColorProfile from '../common/view/MoleculeShapesColorProfile.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapesStrings from '../molecule-shapes-strings.js';
import moleculeShapes from '../moleculeShapes.js';
import RealMoleculesModel from './RealMoleculesModel.js';
import RealMoleculesScreenView from './RealMoleculesScreenView.js';

const screenRealMoleculesString = moleculeShapesStrings.screen.realMolecules;

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

inherit( Screen, RealMoleculesScreen );
export default RealMoleculesScreen;