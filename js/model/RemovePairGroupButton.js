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
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );

  var CROSS_SIZE = 10;
  var crossNode = new Path( new Shape().moveTo( 0, 0 ).lineTo( CROSS_SIZE, CROSS_SIZE ).moveTo( 0, CROSS_SIZE ).lineTo( CROSS_SIZE, 0 ), {
    stroke: '#fff',
    lineWidth: 3
  } );

  function RemovePairGroupButton( options ) {
    var button = this;

    RectangularPushButton.call( this, _.extend( {
      content: crossNode,
      xMargin: 5,
      yMargin: 5
    }, options ) );

    MoleculeShapesColors.link( 'removePairGroup', function( color ) {
      button.baseColor = color;
    } );
  }

  return inherit( RectangularPushButton, RemovePairGroupButton );
} );

