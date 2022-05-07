// Copyright 2014-2022, University of Colorado Boulder

/**
 * A red button with an 'X' that, when clicked, will remove an atom (with a bond type) or a lone pair from the main molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import moleculeShapes from '../moleculeShapes.js';

const CROSS_SIZE = 10;
const crossNode = new Path( new Shape().moveTo( 0, 0 ).lineTo( CROSS_SIZE, CROSS_SIZE ).moveTo( 0, CROSS_SIZE ).lineTo( CROSS_SIZE, 0 ), {
  stroke: '#fff',
  lineWidth: 3
} );

class RemovePairGroupButton extends RectangularPushButton {
  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    super( merge( {
      content: new Node( { children: [ crossNode ] } ),
      xMargin: 5,
      yMargin: 5
    }, options ) );

    MoleculeShapesColors.removePairGroupProperty.link( color => {
      this.baseColor = color;
    } );
  }
}

moleculeShapes.register( 'RemovePairGroupButton', RemovePairGroupButton );
export default RemovePairGroupButton;