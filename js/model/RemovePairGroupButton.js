//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A red button with an 'X' that, when clicked, will remove an atom (with a bond type) or a lone pair from the main molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  var crossSize = 10;
  var crossNode = new Path( new Shape().moveTo( 0, 0 ).lineTo( crossSize, crossSize ).moveTo( 0, crossSize ).lineTo( crossSize, 0 ), {
    stroke: '#fff',
    lineWidth: 3
  } );

  function RemovePairGroupButton( options ) {
    RectangularPushButton.call( this, _.extend( {
      content: crossNode,
      baseColor: '#d00', // TODO: color dependent on scheme?
      xMargin: 5,
      yMargin: 5
    }, options ) );
  }

  return inherit( RectangularPushButton, RemovePairGroupButton, {

  } );
} );

