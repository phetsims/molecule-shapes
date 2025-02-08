// Copyright 2014-2025, University of Colorado Boulder

/**
 * Preferences controls for molecule-shapes that may change simulation representation or behavior.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesStrings from '../../MoleculeShapesStrings.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';

class SimulationPreferencesContentNode extends VBox {
  /**
   * @param {boolean} isBasicsVersion
   * @param {Tandem} tandem
   */
  constructor( isBasicsVersion, tandem ) {

    const children = [];

    if ( !isBasicsVersion ) {
      const showOuterLonePairsCheckboxTandem = tandem.createTandem( 'showOuterLonePairsCheckbox' );

      const label = new Text( MoleculeShapesStrings.options.showOuterLonePairsStringProperty, {
        font: PreferencesDialog.CONTENT_FONT,
        maxWidth: 350,
        tandem: showOuterLonePairsCheckboxTandem.createTandem( 'labelText' )
      } );

      children.push( new Checkbox( MoleculeShapesGlobals.showOuterLonePairsProperty, label, {
        tandem: showOuterLonePairsCheckboxTandem
      } ) );
    }

    // A VBox is used to easily add in more controls in the future.
    super( {
      children: children,
      spacing: PreferencesDialog.CONTENT_SPACING,
      align: 'left'
    } );
  }
}

moleculeShapes.register( 'SimulationPreferencesContentNode', SimulationPreferencesContentNode );

export default SimulationPreferencesContentNode;