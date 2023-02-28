// Copyright 2014-2023, University of Colorado Boulder

/**
 * Options (lone pair and bond angle toggles) that are shown within a panel
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesStrings from '../../MoleculeShapesStrings.js';
import MoleculeShapesGlobals from '../MoleculeShapesGlobals.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';

const optionsFont = new PhetFont( 14 );

class OptionsNode extends VerticalCheckboxGroup {
  /**
   * @param {MoleculeShapesModel} model
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( model, tandem, providedOptions ) {
    const options = optionize()( { // eslint-disable-line bad-text
      touchAreaXDilation: 10,
      tandem: tandem
    }, providedOptions );

    super( [
      ...( model.isBasicsVersion ? [] : [ {
        property: model.showLonePairsProperty,
        createNode: tandem => new Text( MoleculeShapesStrings.control.showLonePairsStringProperty, {
          font: optionsFont,
          fill: MoleculeShapesColors.controlPanelTextProperty,
          tandem: tandem.createTandem( 'labelText' ),
          maxWidth: 280
        } ),
        tandemName: 'showLonePairsCheckbox',
        options: combineOptions( {}, MoleculeShapesGlobals.checkboxOptions )
      } ] ),
      {
        property: model.showBondAnglesProperty,
        createNode: tandem => new Text( MoleculeShapesStrings.control.showBondAnglesStringProperty, {
          font: optionsFont,
          fill: MoleculeShapesColors.controlPanelTextProperty,
          tandem: tandem.createTandem( 'labelText' ),
          maxWidth: 280
        } ),
        tandemName: 'showBondAnglesCheckbox',
        options: MoleculeShapesGlobals.checkboxOptions
      }
    ], options );
  }
}

moleculeShapes.register( 'OptionsNode', OptionsNode );
export default OptionsNode;