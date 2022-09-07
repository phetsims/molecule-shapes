// Copyright 2014-2022, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import MoleculeShapesStrings from '../MoleculeShapesStrings.js';
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
      name: MoleculeShapesStrings.screen.realMoleculesStringProperty,
      backgroundColorProperty: MoleculeShapesColors.backgroundProperty,
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