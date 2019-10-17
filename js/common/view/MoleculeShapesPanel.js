// Copyright 2014-2019, University of Colorado Boulder

/**
 * A TitledPanel with colors and sizing specific to the Molecule Shapes simulation.
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
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TitledPanel = require( 'MOLECULE_SHAPES/common/view/TitledPanel' );

  /**
   * @constructor
   *
   * @param {string} titleString
   * @param {Node} contentNode
   * @param {Object} [options]
   */
  function MoleculeShapesPanel( titleString, contentNode, options ) {
    options = merge( {
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

    const titleNode = new Text( titleString, {
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

