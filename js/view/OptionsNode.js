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
  var CheckBox = require( 'SUN/CheckBox' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );

  var showLonePairsString = require( 'string!MOLECULE_SHAPES/control.showLonePairs' );
  var showBondAnglesString = require( 'string!MOLECULE_SHAPES/control.showBondAngles' );

  function GeometryNamePanel( showLonePairsProperty, showBondAnglesProperty, options ) {

    var showLonePairsLabel = new Text( showLonePairsString, {
      font: new PhetFont( 14 )
    } );
    var showBondAnglesLabel = new Text( showBondAnglesString, {
      font: new PhetFont( 14 )
    } );

    MoleculeShapesColors.link( 'controlPanelText', function( color ) {
      showLonePairsLabel.fill = showBondAnglesLabel.fill = color;
    } );

    var showLonePairsCheckbox = new CheckBox( showLonePairsLabel, showLonePairsProperty, {} );
    var showBondAnglesCheckbox = new CheckBox( showBondAnglesLabel, showBondAnglesProperty, {} );

    VBox.call( this, _.extend( {
      children: [
        showLonePairsCheckbox,
        showBondAnglesCheckbox
      ],
      spacing: 10,
      align: 'left'
    }, options ) );
  }

  return inherit( VBox, GeometryNamePanel, {

  } );
} );

