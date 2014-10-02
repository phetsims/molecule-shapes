//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Location for all colors (especially those that could change for the basics version, or could be tweaked)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var extend = require( 'PHET_CORE/extend' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Color = require( 'SCENERY/util/Color' );

  var colors = {
    background: {
      default: new Color( 30, 30, 30 ),
      basics: new Color( 252, 216, 124 ),
      projector: new Color( 255, 255, 255 )
    },
    centralAtom: {
      default: new Color( 159, 102, 218 )
    },
    atom: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 153, 153, 153 )
    },
    bond: {
      default: new Color( 255, 255, 255 )
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
      basics: new Color( 54, 47, 14 ),
      projector: new Color( 102, 0, 204 )
    },
    electronGeometryName: {
      default: new Color( 255, 204, 102 ),
      projector: new Color( 0, 102, 102 )
    },
    bondAngleReadout: {
      default: new Color( 255, 255, 255 ),
      basics: new Color( 0, 0, 0 ),
      projector: new Color( 0, 0, 0 )
    },
    bondAngleSweep: {
      default: new Color( 128, 128, 128 ),
      projector: new Color( 156, 156, 156 )
    },
    bondAngleArc: {
      default: new Color( 255, 0, 0 )
    },
    removeButtonText: {
      default: new Color( 0, 0, 0 )
    },
    removeButtonBackground: {
      default: new Color( 255, 200, 0 ),
      basics: new Color( 204, 204, 204 )
    },
    sun: {
      default: new Color( 255, 255, 255 ),
      basics: new Color( 153, 153, 153 )
    },
    moon: {
      default: new Color( 255, 255, 255 )
    }
  };

  var initialProperties = {};
  for ( var key in colors ) {
    initialProperties[key] = colors[key].default;
  }

  return extend( new PropertySet( initialProperties ), {
    // @param {string} profileName - one of 'default', 'basics' or 'projector'
    applyProfile: function( profileName ) {
      assert && assert( profileName === 'default' || profileName === 'basics' || profileName === 'projector' );

      for ( var key in colors ) {
        if ( profileName in colors[key] ) {
          this[key] = colors[key][profileName];
        }
      }
    }
  } );
} );

