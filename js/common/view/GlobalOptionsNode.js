// Copyright 2014-2020, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import OptionsDialog from '../../../../joist/js/OptionsDialog.js';
import ProjectorModeCheckbox from '../../../../joist/js/ProjectorModeCheckbox.js';
import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';

const optionsShowOuterLonePairsString = moleculeShapesStrings.options.showOuterLonePairs;

function GlobalOptionsNode( isBasicsVersion, options ) {

  options = merge( {
    defaultColorProfileName: 'default'
  }, options );

  const children = [];

  if ( !isBasicsVersion ) {
    children.push( new Checkbox( new Text( optionsShowOuterLonePairsString, {
        font: OptionsDialog.DEFAULT_FONT,
        maxWidth: 350
      } ),
      MoleculeShapesGlobals.showOuterLonePairsProperty, {} ) );
  }

  children.push( new ProjectorModeCheckbox( MoleculeShapesColorProfile, {
    defaultColorProfileName: options.defaultColorProfileName
  } ) );

  VBox.call( this, {
    children: children,
    spacing: OptionsDialog.DEFAULT_SPACING,
    align: 'left'
  } );
}

moleculeShapes.register( 'GlobalOptionsNode', GlobalOptionsNode );

inherit( VBox, GlobalOptionsNode );
export default GlobalOptionsNode;