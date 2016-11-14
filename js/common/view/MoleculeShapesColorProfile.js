// Copyright 2014-2015, University of Colorado Boulder

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
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var ColorProfile = require( 'SCENERY_PHET/ColorProfile' );
  var Color = require( 'SCENERY/util/Color' );

  // Initial colors for each profile, by string key. If a basics/projector color is not defined, it will take the
  // 'default' value provided.
  // NOTE: This is NOT provided to clients directly, but is passed to the PropertySet constructor.
  var MoleculeShapesColorProfile = new ColorProfile( {
    background: {
      default: new Color( 0, 0, 0 ),
      basics: new Color( 198, 226, 246 ),
      projector: new Color( 255, 255, 255 )
    },
    centralAtom: {
      default: new Color( 159, 102, 218 ),
      basics: new Color( 153, 90, 216 )
    },
    atom: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 153, 153, 153 )
    },
    bond: {
      default: new Color( 255, 255, 255 ),
      basics: new Color( 230, 230, 230 )
    },
    controlPanelBorder: {
      default: new Color( 210, 210, 210 ),
      basics: new Color( 30, 30, 30 ),
      projector: new Color( 30, 30, 30 )
    },
    controlPanelTitle: {
      default: new Color( 240, 240, 240 ),
      projector: new Color( 0, 0, 0 ),
      basics: new Color( 0, 0, 0 )
    },
    controlPanelText: {
      default: new Color( 230, 230, 230 ),
      projector: new Color( 0, 0, 0 ),
      basics: new Color( 0, 0, 0 )
    },
    realExampleFormula: {
      default: new Color( 230, 230, 230 ),
      projector: new Color( 0, 0, 0 )
    },
    realExampleBorder: {
      default: new Color( 60, 60, 60 ),
      projector: new Color( 230, 230, 230 )
    },
    lonePairShell: {
      default: new Color( 255, 255, 255, 0.7 ),
      projector: new Color( 178, 178, 178, 0.7 )
    },
    lonePairElectron: {
      default: new Color( 255, 255, 0, 0.8 ),
      projector: new Color( 0, 0, 0, 0.8 )
    },
    moleculeGeometryName: {
      default: new Color( 255, 255, 140 ),
      basics: new Color( 0, 0, 0 ),
      projector: new Color( 102, 0, 204 )
    },
    electronGeometryName: {
      default: new Color( 255, 204, 102 ),
      basics: new Color( 0, 0, 0 ),
      projector: new Color( 0, 102, 102 )
    },
    bondAngleReadout: {
      default: new Color( 255, 255, 255 ),
      basics: new Color( 0, 0, 0 ),
      projector: new Color( 0, 0, 0 )
    },
    bondAngleSweep: {
      default: new Color( 128, 128, 128 ),
      basics: new Color( 84, 122, 165 ),
      projector: new Color( 156, 156, 156 )
    },
    bondAngleArc: {
      default: new Color( 255, 0, 0 ),
      basics: new Color( 0, 0, 0 )
    },
    removeButtonText: {
      default: new Color( 0, 0, 0 )
    },
    removeButtonBackground: {
      default: new Color( 255, 200, 0 )
    },
    checkBox: {
      default: new Color( 230, 230, 230 ),
      basics: new Color( 0, 0, 0 ),
      projector: new Color( 0, 0, 0 )
    },
    checkBoxBackground: {
      default: new Color( 30, 30, 30 ),
      basics: new Color( 255, 255, 255 ),
      projector: new Color( 255, 255, 255 )
    },
    removePairGroup: {
      default: new Color( '#d00' )
    }
  }, [ 'default', 'basics', 'projector' ] );

  moleculeShapes.register( 'MoleculeShapesColorProfile', MoleculeShapesColorProfile );

  return MoleculeShapesColorProfile;
} );

