// Copyright 2014-2015, University of Colorado Boulder

/**
 * Bond angle label in Scenery
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
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

  moleculeShapes.register( 'LabelFallbackNode', LabelFallbackNode );

  return inherit( Text, LabelFallbackNode, {
    /*
     * Displays and positions the label, and sets its text.
     * Same as API for LabelWebGLView
     * @public
     *
     * @param {string} string
     * @param {number} brightness - In range [0,1]
     * @param {Vector2} centerScreenPoint - The center of the central atom in screen coordinates
     * @param {Vector2} midScreenPoint - The midpoint of the bond-angle arc in screen coordinates
     * @param {number} layoutScale - The ScreenView's layout scale
     */
    setLabel: function( string, brightness, centerScreenPoint, midScreenPoint, layoutScale ) {
      this.text = string;
      this.visible = true;

      var localCenter = this.globalToParentPoint( centerScreenPoint );
      var localMidpoint = this.globalToParentPoint( midScreenPoint );

      this.center = localMidpoint.plus( localMidpoint.minus( localCenter ).times( 0.3 ) );
      this.fill = MoleculeShapesColors.bondAngleReadout.withAlpha( brightness );
    },

    /*
     * Makes the label invisible.
     * Same as API for LabelWebGLView
     * @public
     */
    unsetLabel: function() {
      this.visible = false;
    }
  } );
} );