//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Bond angle label in Scenery
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  function LabelFallbackNode() {
    Text.call( this, '', {
      font: new PhetFont( 16 ),
      visible: false
    } );
  }

  return inherit( Text, LabelFallbackNode, {
    setLabel: function( string, brightness, centerScreenPoint, midScreenPoint, layoutScale ) {
      this.text = string;
      this.visible = true;

      var localCenter = this.globalToParentPoint( centerScreenPoint );
      var localMidpoint = this.globalToParentPoint( midScreenPoint );

      this.center = localMidpoint.plus( localMidpoint.minus( localCenter ).times( 0.3 ) );
      this.fill = MoleculeShapesColors.bondAngleReadout.withAlpha( brightness );
    },

    unsetLabel: function() {
      this.visible = false;
    }
  } );
} );