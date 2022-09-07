// Copyright 2014-2022, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import MoleculeShapesStrings from '../MoleculeShapesStrings.js';
import ModelMoleculesModel from './ModelMoleculesModel.js';
import ModelMoleculesScreenView from './ModelMoleculesScreenView.js';

class ModelMoleculesScreen extends Screen {

  /**
   * Creates the model and view for the ModelMoleculesScreen
   *
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   * @param {Tandem} tandem
   */
  constructor( isBasicsVersion, tandem ) {
    const options = {
      name: MoleculeShapesStrings.screen.modelStringProperty,
      backgroundColorProperty: MoleculeShapesColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon( new ScreenIconNode( true, isBasicsVersion ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      tandem: tandem
    };

    super(
      () => new ModelMoleculesModel( isBasicsVersion, tandem.createTandem( 'model' ) ),
      model => new ModelMoleculesScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

moleculeShapes.register( 'ModelMoleculesScreen', ModelMoleculesScreen );
export default ModelMoleculesScreen;