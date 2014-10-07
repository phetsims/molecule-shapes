//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Global settings and quality information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );

  return {
    useWebGL: !window.phetcommon.getQueryParameter( 'canvasOnly' ) && Util.isWebGLSupported(),

    toColorProperty: function( color ) {
      // for now, cast it into place
      var colorProperty;
      if ( typeof color === 'string' ) {
        color = new Color( color );
      }
      if ( color instanceof Color ) {
        colorProperty = new Property( color );
      } else if ( color instanceof Property ) {
        colorProperty = color;
      } else {
        throw new Error( 'bad color passed to AtomView' );
      }
      return colorProperty;
    }
  };
} );

