// Copyright 2014-2022, University of Colorado Boulder

/**
 * Options (lone pair and bond angle toggles) that are shown within a panel
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import MoleculeShapesCheckbox from './MoleculeShapesCheckbox.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';

const optionsFont = new PhetFont( 14 );

class OptionsNode extends VBox {
  /**
   * @param {MoleculeShapesModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {
    const showLonePairsCheckboxTandem = model.isBasicsVersion ? Tandem.OPT_OUT : tandem.createTandem( 'showLonePairsCheckbox' );
    const showBondAnglesCheckboxTandem = tandem.createTandem( 'showBondAnglesCheckbox' );

    const showLonePairsLabel = new Text( moleculeShapesStrings.control.showLonePairs, {
      font: optionsFont,
      fill: MoleculeShapesColors.controlPanelTextProperty,
      tandem: showLonePairsCheckboxTandem.createTandem( 'labelText' ),
      maxWidth: 280,
      textProperty: moleculeShapesStrings.control.showLonePairsProperty
    } );

    const showBondAnglesLabel = new Text( moleculeShapesStrings.control.showBondAngles, {
      font: optionsFont,
      fill: MoleculeShapesColors.controlPanelTextProperty,
      tandem: showBondAnglesCheckboxTandem.createTandem( 'labelText' ),
      maxWidth: 280,
      textProperty: moleculeShapesStrings.control.showBondAnglesProperty
    } );

    const showLonePairsCheckbox = new MoleculeShapesCheckbox( model.showLonePairsProperty, showLonePairsLabel, {
      enabledPropertyOptions: { phetioReadOnly: true },
      tandem: showLonePairsCheckboxTandem
    } );
    const showBondAnglesCheckbox = new MoleculeShapesCheckbox( model.showBondAnglesProperty, showBondAnglesLabel, {
      tandem: showBondAnglesCheckboxTandem
    } );

    // touch areas
    const lonePairTouchArea = showLonePairsCheckbox.localBounds.dilatedXY( 10, 4 );
    const bondAngleTouchArea = showBondAnglesCheckbox.localBounds.dilatedXY( 10, 4 );
    // extend both out as far as needed
    lonePairTouchArea.maxX = bondAngleTouchArea.maxX = Math.max( lonePairTouchArea.maxX, bondAngleTouchArea.maxX );
    // extend the bottom touch area below
    bondAngleTouchArea.maxY += 10;
    // extend the top touch area above (changes depending on whether it's basics version or not)
    ( model.isBasicsVersion ? bondAngleTouchArea : lonePairTouchArea ).minY -= 10;
    showLonePairsCheckbox.touchArea = lonePairTouchArea;
    showBondAnglesCheckbox.touchArea = bondAngleTouchArea;

    // TODO: Don't create both on basics?
    super( merge( {
      children: model.isBasicsVersion ? [ showBondAnglesCheckbox ] : [ showLonePairsCheckbox, showBondAnglesCheckbox ],
      spacing: 10,
      align: 'left'
    }, options ) );
  }
}

moleculeShapes.register( 'OptionsNode', OptionsNode );
export default OptionsNode;