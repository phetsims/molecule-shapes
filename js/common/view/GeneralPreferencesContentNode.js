// Copyright 2014-2022, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';

class GeneralPreferencesContentNode extends VBox {
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

      label = new Text( moleculeShapesStrings.options.showOuterLonePairsProperty, {
        font: PreferencesDialog.CONTENT_FONT,
        maxWidth: 350,
        tandem: showOuterLonePairsCheckboxTandem.createTandem( 'labelText' )
      } );

      checkboxes.push( new Checkbox( MoleculeShapesGlobals.showOuterLonePairsProperty, label, {
        tandem: showOuterLonePairsCheckboxTandem
      } ) );
    }

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

moleculeShapes.register( 'GeneralPreferencesContentNode', GeneralPreferencesContentNode );

export default GeneralPreferencesContentNode;