// Copyright 2014-2020, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import OptionsDialog from '../../../../joist/js/OptionsDialog.js';
import ProjectorModeCheckbox from '../../../../joist/js/ProjectorModeCheckbox.js';
import merge from '../../../../phet-core/js/merge.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';

const optionsShowOuterLonePairsString = moleculeShapesStrings.options.showOuterLonePairs;

class GlobalOptionsNode extends VBox {
  /**
   * @param {boolean} isBasicsVersion
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( isBasicsVersion, tandem, options ) {

    options = merge( {
      defaultColorProfileName: 'default'
    }, options );

    const children = [];

    if ( !isBasicsVersion ) {
      children.push( new Checkbox( new Text( optionsShowOuterLonePairsString, {
          font: OptionsDialog.DEFAULT_FONT,
          maxWidth: 350
        } ),
        MoleculeShapesGlobals.showOuterLonePairsProperty, {
          tandem: tandem.createTandem( 'showOuterLonePairsCheckbox' )
        } ) );
    }

    children.push( new ProjectorModeCheckbox( MoleculeShapesColorProfile, {
      defaultColorProfileName: options.defaultColorProfileName,
      tandem: tandem.createTandem( 'projectorModeCheckbox' )
    } ) );

    super( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } );
  }
}

moleculeShapes.register( 'GlobalOptionsNode', GlobalOptionsNode );

export default GlobalOptionsNode;