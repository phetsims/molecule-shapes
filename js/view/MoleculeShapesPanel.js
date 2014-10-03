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
  var TitledPanel = require( 'MOLECULE_SHAPES/view/TitledPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );

  function MoleculeShapesPanel( titleString, contentNode, options ) {
    var self = this;

    options = _.extend( {
      // TODO: remove duplication with panel, but we want these set before-hand! Extract defaults from Panel?
      lineWidth: 1, // width of the background border
      xMargin: 15,
      yMargin: 15,
      cornerRadius: 15, // radius of the rounded corners on the background
      resize: true, // dynamically resize when content bounds change
      backgroundPickable: false
    }, options );

    var titleNode = new Text( titleString, {
      font: new PhetFont( 18 )
    } );
    MoleculeShapesColors.link( 'controlPanelTitle', function( color ) {
      titleNode.fill = color;
    } );

    TitledPanel.call( this, titleNode, contentNode, options );

    MoleculeShapesColors.link( 'controlPanelBorder', function( color ) {
      self.setStroke( color );
    } );
    MoleculeShapesColors.link( 'background', function( color ) {
      self.setFill( color );
    } );
  }

  return inherit( TitledPanel, MoleculeShapesPanel, {

  } );
} );

