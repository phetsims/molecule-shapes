// Copyright 2014-2021, University of Colorado Boulder

/**
 * A TitledPanel with colors and sizing specific to the Molecule Shapes simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';
import TitledPanel from './TitledPanel.js';

class MoleculeShapesPanel extends TitledPanel {
  /**
   * @param {string} titleString
   * @param {Node} contentNode
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( titleString, contentNode, tandem, options ) {
    options = merge( {
      lineWidth: 1.5,
      xMargin: MoleculeShapesPanel.xMargin,
      yMargin: 15,
      cornerRadius: 15,
      resize: true,

      // we want everything to absorb events, since things behind the panel are pickable
      backgroundPickable: true,
      pickable: true,
      fill: MoleculeShapesColors.backgroundProperty,
      stroke: MoleculeShapesColors.controlPanelBorderProperty
    }, options );

    const titleNode = new Text( titleString, {
      font: new PhetFont( 18 ),
      fill: MoleculeShapesColors.controlPanelTitleProperty,
      tandem: tandem.createTandem( 'titleNode' )
    } );

    super( titleNode, contentNode, options );
  }
}

MoleculeShapesPanel.xMargin = 15;

moleculeShapes.register( 'MoleculeShapesPanel', MoleculeShapesPanel );

export default MoleculeShapesPanel;