// Copyright 2014-2017, University of Colorado Boulder

/**
 * Bond angle label in Scenery
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );

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

      const localCenter = this.globalToParentPoint( centerScreenPoint );
      const localMidpoint = this.globalToParentPoint( midScreenPoint );

      this.center = localMidpoint.plus( localMidpoint.minus( localCenter ).times( 0.3 ) );
      this.fill = MoleculeShapesColorProfile.bondAngleReadoutProperty.get().withAlpha( brightness );
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