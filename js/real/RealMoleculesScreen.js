// Copyright 2014-2021, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import moleculeShapesColorProfile from '../common/view/moleculeShapesColorProfile.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import moleculeShapesStrings from '../moleculeShapesStrings.js';
import RealMoleculesModel from './RealMoleculesModel.js';
import RealMoleculesScreenView from './RealMoleculesScreenView.js';

class RealMoleculesScreen extends Screen {

  /**
   * Creates the model and view for the RealMoleculesScreen
   *
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   * @param {Tandem} tandem
   */
  constructor( isBasicsVersion, tandem ) {
    const options = {
      name: moleculeShapesStrings.screen.realMolecules,
      backgroundColorProperty: moleculeShapesColorProfile.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new ScreenIconNode( false, isBasicsVersion ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new RealMoleculesModel( isBasicsVersion, tandem.createTandem( 'model' ) ),
      model => new RealMoleculesScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

moleculeShapes.register( 'RealMoleculesScreen', RealMoleculesScreen );
export default RealMoleculesScreen;