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

  function OptionsNode( model, options ) {

    var showLonePairsLabel = new Text( showLonePairsString, {
      font: new PhetFont( 14 )
    } );
    MoleculeShapesColors.linkAttribute( 'controlPanelText', showLonePairsLabel, 'fill' );
    var showBondAnglesLabel = new Text( showBondAnglesString, {
      font: new PhetFont( 14 )
    } );
    MoleculeShapesColors.linkAttribute( 'controlPanelText', showBondAnglesLabel, 'fill' );

    var showLonePairsCheckbox = new MoleculeShapesCheckBox( showLonePairsLabel, model.showLonePairsProperty, {} );
    var showBondAnglesCheckbox = new MoleculeShapesCheckBox( showBondAnglesLabel, model.showBondAnglesProperty, {} );

    showLonePairsCheckbox.touchArea = showLonePairsCheckbox.localBounds.dilatedXY( 10, 4 );
    showBondAnglesCheckbox.touchArea = showBondAnglesCheckbox.localBounds.dilatedXY( 10, 4 );

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
      children: model.isBasicsVersion ? [showBondAnglesCheckbox] : [showLonePairsCheckbox, showBondAnglesCheckbox],
      spacing: 10,
      align: 'left'
    }, options ) );
  }

  return inherit( VBox, OptionsNode, {

  } );
} );

