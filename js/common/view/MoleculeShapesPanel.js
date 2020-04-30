// Copyright 2014-2020, University of Colorado Boulder

/**
 * A TitledPanel with colors and sizing specific to the Molecule Shapes simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';
import TitledPanel from './TitledPanel.js';

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

inherit( TitledPanel, MoleculeShapesPanel, {}, {
  xMargin: 15 // need to make this available for outside code to compute widths
} );

export default MoleculeShapesPanel;