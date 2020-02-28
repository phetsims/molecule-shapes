// Copyright 2014-2020, University of Colorado Boulder

/**
 * A red button with an 'X' that, when clicked, will remove an atom (with a bond type) or a lone pair from the main molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Shape from '../../../kite/js/Shape.js';
import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import Path from '../../../scenery/js/nodes/Path.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import MoleculeShapesColorProfile from '../common/view/MoleculeShapesColorProfile.js';
import moleculeShapes from '../moleculeShapes.js';

const CROSS_SIZE = 10;
const crossNode = new Path( new Shape().moveTo( 0, 0 ).lineTo( CROSS_SIZE, CROSS_SIZE ).moveTo( 0, CROSS_SIZE ).lineTo( CROSS_SIZE, 0 ), {
  stroke: '#fff',
  lineWidth: 3
} );

function RemovePairGroupButton( options ) {
  const self = this;

  RectangularPushButton.call( this, merge( {
    content: crossNode,
    xMargin: 5,
    yMargin: 5
  }, options ) );

  MoleculeShapesColorProfile.removePairGroupProperty.link( function( color ) {
    self.baseColor = color;
  } );
}

moleculeShapes.register( 'RemovePairGroupButton', RemovePairGroupButton );

inherit( RectangularPushButton, RemovePairGroupButton );
export default RemovePairGroupButton;