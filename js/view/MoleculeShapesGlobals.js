//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Global settings and quality information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var Util = require( 'SCENERY/util/Util' );

  return {
    useWebGL: !window.phetcommon.getQueryParameter( 'canvasOnly' ) && Util.isWebGLSupported()
  };
} );

