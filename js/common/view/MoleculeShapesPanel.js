// Copyright 2014-2017, University of Colorado Boulder

/**
 * A TitledPanel with colors and sizing specific to the Molecule Shapes simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TitledPanel = require( 'MOLECULE_SHAPES/common/view/TitledPanel' );

  /**
   * @constructor
   *
   * @param {string} titleString
   * @param {Node} contentNode
   * @param {Object} [options]
   */
  function MoleculeShapesPanel( titleString, contentNode, options ) {
    options = _.extend( {
      lineWidth: 1.5,
      xMargin: MoleculeShapesPanel.xMargin,
      yMargin: 15,
      cornerRadius: 15,
      resize: true,

      // we want everything to absorb events, since things behind the panel are pickable
      backgroundPickable: true,
      pickable: true,
      fill: MoleculeShapesColorProfile.backgroundProperty,
      stroke: MoleculeShapesColorProfile.controlPanelBorderProperty
    }, options );

    var titleNode = new Text( titleString, {
      font: new PhetFont( 18 ),
      fill: MoleculeShapesColorProfile.controlPanelTitleProperty
    } );

    TitledPanel.call( this, titleNode, contentNode, options );
  }

  moleculeShapes.register( 'MoleculeShapesPanel', MoleculeShapesPanel );

  return inherit( TitledPanel, MoleculeShapesPanel, {}, {
    xMargin: 15 // need to make this available for outside code to compute widths
  } );
} );

