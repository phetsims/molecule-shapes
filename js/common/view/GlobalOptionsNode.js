// Copyright 2014-2021, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import OptionsDialog from '../../../../joist/js/OptionsDialog.js';
import ProjectorModeCheckbox from '../../../../joist/js/ProjectorModeCheckbox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';

const optionsShowOuterLonePairsString = moleculeShapesStrings.options.showOuterLonePairs;

class GlobalOptionsNode extends VBox {
  /**
   * @param {boolean} isBasicsVersion
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( isBasicsVersion, tandem, options ) {

    const checkboxes = [];

    if ( !isBasicsVersion ) {
      const showOuterLonePairsCheckboxTandem = tandem.createTandem( 'showOuterLonePairsCheckbox' );
      checkboxes.push( new Checkbox( new Text( optionsShowOuterLonePairsString, {
          font: OptionsDialog.DEFAULT_FONT,
          maxWidth: 350,
          tandem: showOuterLonePairsCheckboxTandem.createTandem( 'labelText' )
        } ),
        MoleculeShapesGlobals.showOuterLonePairsProperty, {
          tandem: showOuterLonePairsCheckboxTandem
        } ) );
    }

    checkboxes.push( new ProjectorModeCheckbox( {
      tandem: tandem.createTandem( 'projectorModeCheckbox' )
    } ) );

    super( {
      children: checkboxes,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } );

    // @private {Array.<Node>}
    this.checkboxes = checkboxes;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.checkboxes.forEach( checkbox => checkbox.dispose() );

    super.dispose();
  }
}

moleculeShapes.register( 'GlobalOptionsNode', GlobalOptionsNode );

export default GlobalOptionsNode;