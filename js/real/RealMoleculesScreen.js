// Copyright 2014-2020, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import inherit from '../../../phet-core/js/inherit.js';
import MoleculeShapesColorProfile from '../common/view/MoleculeShapesColorProfile.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import moleculeShapesStrings from '../moleculeShapesStrings.js';
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
    homeScreenIcon: new ScreenIcon( new ScreenIconNode( false, isBasicsVersion ), {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } )
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