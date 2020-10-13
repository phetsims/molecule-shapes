// Copyright 2014-2020, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MoleculeShapesColorProfile from '../common/view/MoleculeShapesColorProfile.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import moleculeShapesStrings from '../moleculeShapesStrings.js';
import RealMoleculesModel from './RealMoleculesModel.js';
import RealMoleculesScreenView from './RealMoleculesScreenView.js';

class RealMoleculesScreen extends Screen {

  /**
   * Creates the model and view for the RealMoleculesScreen
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  constructor( isBasicsVersion ) {
    const options = {
      name: moleculeShapesStrings.screen.realMolecules,
      backgroundColorProperty: MoleculeShapesColorProfile.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new ScreenIconNode( false, isBasicsVersion ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } )
    };

    super(
      () => new RealMoleculesModel( isBasicsVersion ),
      model => new RealMoleculesScreenView( model ),
      options
    );
  }
}

moleculeShapes.register( 'RealMoleculesScreen', RealMoleculesScreen );
export default RealMoleculesScreen;