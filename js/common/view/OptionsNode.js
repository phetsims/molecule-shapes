// Copyright 2014-2015, University of Colorado Boulder

/**
 * Options (lone pair and bond angle toggles) that are shown within a panel
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MoleculeShapesCheckBox = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesCheckBox' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );

  var controlShowLonePairsString = require( 'string!MOLECULE_SHAPES/control.showLonePairs' );
  var controlShowBondAnglesString = require( 'string!MOLECULE_SHAPES/control.showBondAngles' );

  var optionsFont = new PhetFont( 14 );

  function OptionsNode( model, options ) {
    var showLonePairsLabel = new Text( controlShowLonePairsString, {
      font: optionsFont
    } );
    MoleculeShapesColorProfile.controlPanelTextProperty.linkAttribute( showLonePairsLabel, 'fill' );

    var showBondAnglesLabel = new Text( controlShowBondAnglesString, {
      font: optionsFont
    } );
    MoleculeShapesColorProfile.controlPanelTextProperty.linkAttribute( showBondAnglesLabel, 'fill' );

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

  moleculeShapes.register( 'OptionsNode', OptionsNode );

  return inherit( VBox, OptionsNode, {} );
} );

