// Copyright 2014-2019, University of Colorado Boulder

/**
 * A red button with an 'X' that, when clicked, will remove an atom (with a bond type) or a lone pair from the main molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const Path = require( 'SCENERY/nodes/Path' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const Shape = require( 'KITE/Shape' );

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

  return inherit( RectangularPushButton, RemovePairGroupButton );
} );

