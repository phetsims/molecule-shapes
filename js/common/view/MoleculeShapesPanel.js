//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A TitledPanel with colors and sizing specific to the Molecule Shapes simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TitledPanel = require( 'MOLECULE_SHAPES/common/view/TitledPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );

  function MoleculeShapesPanel( titleString, contentNode, options ) {
    options = _.extend( {
      lineWidth: 1.5,
      xMargin: 15,
      yMargin: 15,
      cornerRadius: 15,
      resize: true,

      // we want everything to absorb events, since things behind the panel are pickable
      backgroundPickable: true,
      pickable: true
    }, options );

    var titleNode = new Text( titleString, {
      font: new PhetFont( 18 )
    } );
    MoleculeShapesColors.linkAttribute( 'controlPanelTitle', titleNode, 'fill' );

    TitledPanel.call( this, titleNode, contentNode, options );

    MoleculeShapesColors.linkAttribute( 'background', this, 'fill' );
    MoleculeShapesColors.linkAttribute( 'controlPanelBorder', this, 'stroke' );
  }

  return inherit( TitledPanel, MoleculeShapesPanel, {} );
} );

