// Copyright 2014-2022, University of Colorado Boulder

/**
 * Location for all colors (especially those that could change for the basics version, or could be tweaked)
 *
 * There are three profiles, 'default', 'basics' (for the Basics version of the sim), and 'projector' (for the Projector
 * mode on both the normal and Basics sims).
 *
 * We also support iframe communication for molecule-shapes-colors.html, where we both send color information changes to
 * our iframe parent container, and receive color change requests from the container. This allows testing out color
 * changes interactively.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import moleculeShapes from '../../moleculeShapes.js';

// Initial colors for each profile, by string key. If a basics/projector color is not defined, it will take the
// 'default' value provided.
const MoleculeShapesColors = {
  backgroundProperty: new ProfileColorProperty( moleculeShapes, 'background', {
    default: new Color( 0, 0, 0 ),
    basics: new Color( 198, 226, 246 ),
    projector: new Color( 255, 255, 255 )
  } ),
  centralAtomProperty: new ProfileColorProperty( moleculeShapes, 'centralAtom', {
    default: new Color( 159, 102, 218 ),
    basics: new Color( 153, 90, 216 )
  } ),
  atomProperty: new ProfileColorProperty( moleculeShapes, 'atom', {
    default: new Color( 255, 255, 255 ),
    projector: new Color( 153, 153, 153 )
  } ),
  bondProperty: new ProfileColorProperty( moleculeShapes, 'bond', {
    default: new Color( 255, 255, 255 ),
    basics: new Color( 230, 230, 230 )
  } ),
  controlPanelBorderProperty: new ProfileColorProperty( moleculeShapes, 'controlPanelBorder', {
    default: new Color( 210, 210, 210 ),
    basics: new Color( 30, 30, 30 ),
    projector: new Color( 30, 30, 30 )
  } ),
  controlPanelTitleProperty: new ProfileColorProperty( moleculeShapes, 'controlPanelTitle', {
    default: new Color( 240, 240, 240 ),
    projector: new Color( 0, 0, 0 ),
    basics: new Color( 0, 0, 0 )
  } ),
  controlPanelTextProperty: new ProfileColorProperty( moleculeShapes, 'controlPanelText', {
    default: new Color( 230, 230, 230 ),
    projector: new Color( 0, 0, 0 ),
    basics: new Color( 0, 0, 0 )
  } ),
  realExampleFormulaProperty: new ProfileColorProperty( moleculeShapes, 'realExampleFormula', {
    default: new Color( 230, 230, 230 ),
    projector: new Color( 0, 0, 0 )
  } ),
  realExampleBorderProperty: new ProfileColorProperty( moleculeShapes, 'realExampleBorder', {
    default: new Color( 60, 60, 60 ),
    projector: new Color( 230, 230, 230 )
  } ),
  lonePairShellProperty: new ProfileColorProperty( moleculeShapes, 'lonePairShell', {
    default: new Color( 255, 255, 255, 0.7 ),
    projector: new Color( 178, 178, 178, 0.7 )
  } ),
  lonePairElectronProperty: new ProfileColorProperty( moleculeShapes, 'lonePairElectron', {
    default: new Color( 255, 255, 0, 0.8 ),
    projector: new Color( 0, 0, 0, 0.8 )
  } ),
  moleculeGeometryNameProperty: new ProfileColorProperty( moleculeShapes, 'moleculeGeometryName', {
    default: new Color( 255, 255, 140 ),
    basics: new Color( 0, 0, 0 ),
    projector: new Color( 102, 0, 204 )
  } ),
  electronGeometryNameProperty: new ProfileColorProperty( moleculeShapes, 'electronGeometryName', {
    default: new Color( 255, 204, 102 ),
    basics: new Color( 0, 0, 0 ),
    projector: new Color( 0, 102, 102 )
  } ),
  bondAngleReadoutProperty: new ProfileColorProperty( moleculeShapes, 'bondAngleReadout', {
    default: new Color( 255, 255, 255 ),
    basics: new Color( 0, 0, 0 ),
    projector: new Color( 0, 0, 0 )
  } ),
  bondAngleSweepProperty: new ProfileColorProperty( moleculeShapes, 'bondAngleSweep', {
    default: new Color( 128, 128, 128 ),
    basics: new Color( 84, 122, 165 ),
    projector: new Color( 156, 156, 156 )
  } ),
  bondAngleArcProperty: new ProfileColorProperty( moleculeShapes, 'bondAngleArc', {
    default: new Color( 255, 0, 0 ),
    basics: new Color( 0, 0, 0 )
  } ),
  removeButtonTextProperty: new ProfileColorProperty( moleculeShapes, 'removeButtonText', {
    default: new Color( 0, 0, 0 )
  } ),
  removeButtonBackgroundProperty: new ProfileColorProperty( moleculeShapes, 'removeButtonBackground', {
    default: new Color( 255, 200, 0 )
  } ),
  checkboxProperty: new ProfileColorProperty( moleculeShapes, 'checkbox', {
    default: new Color( 230, 230, 230 ),
    basics: new Color( 0, 0, 0 ),
    projector: new Color( 0, 0, 0 )
  } ),
  checkboxBackgroundProperty: new ProfileColorProperty( moleculeShapes, 'checkboxBackground', {
    default: new Color( 30, 30, 30 ),
    basics: new Color( 255, 255, 255 ),
    projector: new Color( 255, 255, 255 )
  } ),
  removePairGroupProperty: new ProfileColorProperty( moleculeShapes, 'removePairGroup', {
    default: new Color( '#d00' )
  } )
};

moleculeShapes.register( 'MoleculeShapesColors', MoleculeShapesColors );

export default MoleculeShapesColors;
