// Copyright 2014-2022, University of Colorado Boulder

/**
 * Preferences controls for molecule-shapes that may change simulation representation or behavior.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesStrings from '../../MoleculeShapesStrings.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';

class SimulationPreferencesContentNode extends VBox {
  /**
   * @param {boolean} isBasicsVersion
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( isBasicsVersion, tandem, options ) {

    const checkboxes = [];
    let label = null;

    if ( !isBasicsVersion ) {
      const showOuterLonePairsCheckboxTandem = tandem.createTandem( 'showOuterLonePairsCheckbox' );

      label = new Text( MoleculeShapesStrings.options.showOuterLonePairsStringProperty, {
        font: PreferencesDialog.CONTENT_FONT,
        maxWidth: 350,
        tandem: showOuterLonePairsCheckboxTandem.createTandem( 'labelText' )
      } );

      checkboxes.push( new Checkbox( MoleculeShapesGlobals.showOuterLonePairsProperty, label, {
        tandem: showOuterLonePairsCheckboxTandem
      } ) );
    }

    // A VBox is used to easily add in more controls in the future.
    super( {
      children: checkboxes,
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    } );

    // @private {Array.<Node>}
    this.checkboxes = checkboxes;

    // @private {Node|null} - For disposal
    this.label = label;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.checkboxes.forEach( checkbox => checkbox.dispose() );
    this.label && this.label.dispose();

    super.dispose();
  }
}

moleculeShapes.register( 'SimulationPreferencesContentNode', SimulationPreferencesContentNode );

export default SimulationPreferencesContentNode;