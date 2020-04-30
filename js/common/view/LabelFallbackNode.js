// Copyright 2014-2020, University of Colorado Boulder

/**
 * Bond angle label in Scenery
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../../../phet-core/js/inherit.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';

function LabelFallbackNode() {
  Text.call( this, '', {
    font: new PhetFont( 16 ),
    visible: false
  } );
}

moleculeShapes.register( 'LabelFallbackNode', LabelFallbackNode );

inherit( Text, LabelFallbackNode, {
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

export default LabelFallbackNode;