//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A panel with a title on the top, that relies on a consistent background color.
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
      // TODO: remove duplication with panel, but we want these set before-hand! Extract defaults from Panel?
      lineWidth: 1.5, // width of the background border
      xMargin: 15,
      yMargin: 15,
      cornerRadius: 15, // radius of the rounded corners on the background
      resize: true, // dynamically resize when content bounds change
      backgroundPickable: true,
      pickable: true // absorb the events?
    }, options );

    var titleNode = new Text( titleString, {
      font: new PhetFont( 18 )
    } );
    MoleculeShapesColors.linkAttribute( 'controlPanelTitle', titleNode, 'fill' );

    TitledPanel.call( this, titleNode, contentNode, options );

    MoleculeShapesColors.linkAttribute( 'background', this, 'fill' );
    MoleculeShapesColors.linkAttribute( 'controlPanelBorder', this, 'stroke' );
  }

  return inherit( TitledPanel, MoleculeShapesPanel, {

  } );
} );

