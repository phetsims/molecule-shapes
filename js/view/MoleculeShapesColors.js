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
      default: new Color( 0, 0, 0 ),
      basics: new Color( 252, 216, 124 ),
      projector: new Color( 255, 255, 255 )
    },
    centralAtom: {
      default: new Color( 159, 102, 218 )
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

