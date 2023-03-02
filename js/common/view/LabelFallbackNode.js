// Copyright 2014-2023, University of Colorado Boulder

/**
 * Bond angle label in Scenery
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';

class LabelFallbackNode extends Text {
  constructor() {
    super( '', {
      font: new PhetFont( 16 ),
      visible: false
    } );
  }

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
  setLabel( string, brightness, centerScreenPoint, midScreenPoint, layoutScale ) {
    this.string = string;
    this.visible = true;

    const localCenter = this.globalToParentPoint( centerScreenPoint );
    const localMidpoint = this.globalToParentPoint( midScreenPoint );

    this.center = localMidpoint.plus( localMidpoint.minus( localCenter ).times( 0.3 ) );
    this.fill = MoleculeShapesColors.bondAngleReadoutProperty.value.withAlpha( brightness );
  }

  /*
   * Makes the label invisible.
   * Same as API for LabelWebGLView
   * @public
   */
  unsetLabel() {
    this.visible = false;
  }
}

moleculeShapes.register( 'LabelFallbackNode', LabelFallbackNode );

export default LabelFallbackNode;