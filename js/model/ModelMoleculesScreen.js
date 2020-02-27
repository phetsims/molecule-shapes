// Copyright 2014-2019, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import MoleculeShapesColorProfile from '../common/view/MoleculeShapesColorProfile.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapesStrings from '../molecule-shapes-strings.js';
import moleculeShapes from '../moleculeShapes.js';
import ModelMoleculesModel from './ModelMoleculesModel.js';
import ModelMoleculesScreenView from './ModelMoleculesScreenView.js';

const screenModelString = moleculeShapesStrings.screen.model;

/**
 * Creates the model and view for the ModelMoleculesScreen
 * @constructor
 * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
 */
function ModelMoleculesScreen( isBasicsVersion ) {
  const options = {
    name: screenModelString,
    backgroundColorProperty: MoleculeShapesColorProfile.backgroundProperty,
    homeScreenIcon: new ScreenIconNode( true, isBasicsVersion )
  };

  Screen.call( this,
    function() { return new ModelMoleculesModel( isBasicsVersion ); },
    function( model ) { return new ModelMoleculesScreenView( model ); },
    options
  );
}

moleculeShapes.register( 'ModelMoleculesScreen', ModelMoleculesScreen );

inherit( Screen, ModelMoleculesScreen );
export default ModelMoleculesScreen;