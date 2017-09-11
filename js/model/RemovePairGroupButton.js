// Copyright 2014-2015, University of Colorado Boulder

/**
 * A red button with an 'X' that, when clicked, will remove an atom (with a bond type) or a lone pair from the main molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );

  var CROSS_SIZE = 10;
  var crossNode = new Path( new Shape().moveTo( 0, 0 ).lineTo( CROSS_SIZE, CROSS_SIZE ).moveTo( 0, CROSS_SIZE ).lineTo( CROSS_SIZE, 0 ), {
    stroke: '#fff',
    lineWidth: 3
  } );

  function RemovePairGroupButton( options ) {
    var self = this;

    RectangularPushButton.call( this, _.extend( {
      content: crossNode,
      xMargin: 5,
      yMargin: 5
    }, options ) );

    MoleculeShapesColorProfile.removePairGroupProperty.link( function( color ) {
      self.baseColor = color;
    } );
  }

  moleculeShapes.register( 'RemovePairGroupButton', RemovePairGroupButton );

  return inherit( RectangularPushButton, RemovePairGroupButton );
} );

