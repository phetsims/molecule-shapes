//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Options (lone pair and bond angle toggles) that are shown within a panel
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MoleculeShapesCheckBox = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesCheckBox' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );

  var showLonePairsString = require( 'string!MOLECULE_SHAPES/control.showLonePairs' );
  var showBondAnglesString = require( 'string!MOLECULE_SHAPES/control.showBondAngles' );

  var optionsFont = new PhetFont( 14 );

  function OptionsNode( model, options ) {
    var showLonePairsLabel = new Text( showLonePairsString, {
      font: optionsFont
    } );
    MoleculeShapesColors.linkAttribute( 'controlPanelText', showLonePairsLabel, 'fill' );

    var showBondAnglesLabel = new Text( showBondAnglesString, {
      font: optionsFont
    } );
    MoleculeShapesColors.linkAttribute( 'controlPanelText', showBondAnglesLabel, 'fill' );

    var showLonePairsCheckbox = new MoleculeShapesCheckBox( showLonePairsLabel, model.showLonePairsProperty, {} );
    var showBondAnglesCheckbox = new MoleculeShapesCheckBox( showBondAnglesLabel, model.showBondAnglesProperty, {} );

    // touch areas
    var lonePairTouchArea = showLonePairsCheckbox.localBounds.dilatedXY( 10, 4 );
    var bondAngleTouchArea = showBondAnglesCheckbox.localBounds.dilatedXY( 10, 4 );
    // extend both out as far as needed
    lonePairTouchArea.maxX = bondAngleTouchArea.maxX = Math.max( lonePairTouchArea.maxX, bondAngleTouchArea.maxX );
    // extend the bottom touch area below
    bondAngleTouchArea.maxY += 10;
    // extend the top touch area above (changes depending on whether it's basics version or not)
    ( model.isBasicsVersion ? bondAngleTouchArea : lonePairTouchArea ).minY -= 10;
    showLonePairsCheckbox.touchArea = lonePairTouchArea;
    showBondAnglesCheckbox.touchArea = bondAngleTouchArea;

    function updateLonePairCheckboxVisibility() {
      showLonePairsCheckbox.enabled = model.molecule.radialLonePairs.length > 0;
    }

    model.link( 'molecule', function( newMolecule, oldMolecule ) {
      if ( oldMolecule ) {
        oldMolecule.off( 'bondChanged', updateLonePairCheckboxVisibility );
      }
      if ( newMolecule ) {
        newMolecule.on( 'bondChanged', updateLonePairCheckboxVisibility );
      }
      updateLonePairCheckboxVisibility();
    } );

    VBox.call( this, _.extend( {
      children: model.isBasicsVersion ? [ showBondAnglesCheckbox ] : [ showLonePairsCheckbox, showBondAnglesCheckbox ],
      spacing: 10,
      align: 'left'
    }, options ) );
  }

  return inherit( VBox, OptionsNode, {} );
} );

