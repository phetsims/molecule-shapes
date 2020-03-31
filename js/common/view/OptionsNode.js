// Copyright 2014-2020, University of Colorado Boulder

/**
 * Options (lone pair and bond angle toggles) that are shown within a panel
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesCheckbox from './MoleculeShapesCheckbox.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';

const controlShowBondAnglesString = moleculeShapesStrings.control.showBondAngles;
const controlShowLonePairsString = moleculeShapesStrings.control.showLonePairs;

const optionsFont = new PhetFont( 14 );

function OptionsNode( model, options ) {
  const showLonePairsLabel = new Text( controlShowLonePairsString, {
    font: optionsFont,
    fill: MoleculeShapesColorProfile.controlPanelTextProperty
  } );

  const showBondAnglesLabel = new Text( controlShowBondAnglesString, {
    font: optionsFont,
    fill: MoleculeShapesColorProfile.controlPanelTextProperty
  } );

  const showLonePairsCheckbox = new MoleculeShapesCheckbox( showLonePairsLabel, model.showLonePairsProperty, {} );
  const showBondAnglesCheckbox = new MoleculeShapesCheckbox( showBondAnglesLabel, model.showBondAnglesProperty, {} );

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

  function updateLonePairCheckboxVisibility() {
    showLonePairsCheckbox.enabled = model.moleculeProperty.get().radialLonePairs.length > 0;
  }

  model.moleculeProperty.link( function( newMolecule, oldMolecule ) {
    if ( oldMolecule ) {
      oldMolecule.off( 'bondChanged', updateLonePairCheckboxVisibility );
    }
    if ( newMolecule ) {
      newMolecule.on( 'bondChanged', updateLonePairCheckboxVisibility );
    }
    updateLonePairCheckboxVisibility();
  } );

  VBox.call( this, merge( {
    children: model.isBasicsVersion ? [ showBondAnglesCheckbox ] : [ showLonePairsCheckbox, showBondAnglesCheckbox ],
    spacing: 10,
    align: 'left'
  }, options ) );
}

moleculeShapes.register( 'OptionsNode', OptionsNode );

export default inherit( VBox, OptionsNode, {} );