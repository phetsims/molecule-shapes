// Copyright 2014-2019, University of Colorado Boulder

/**
 * Global settings and quality information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const merge = require( 'PHET_CORE/merge' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesQueryParameters = require( 'MOLECULE_SHAPES/common/MoleculeShapesQueryParameters' );
  const platform = require( 'PHET_CORE/platform' );
  const Property = require( 'AXON/Property' );
  const Utils = require( 'SCENERY/util/Utils' );

  const MoleculeShapesGlobals = {
    showOuterLonePairsProperty: new Property( MoleculeShapesQueryParameters.showOuterLonePairs )
  };

  moleculeShapes.register( 'MoleculeShapesGlobals', MoleculeShapesGlobals );

  // polyfill for console.log on IE9, see https://github.com/phetsims/molecule-shapes/issues/108
  if ( platform.ie9 ) {
    window.console = window.console || {};
    window.console.log = window.console.log || function() {};
  }

  let hasBasicWebGLSupport = phet.chipper.queryParameters.webgl && Utils.isWebGLSupported;

  // Check for the presence of a webgl/three.js bug present in https://github.com/phetsims/molecule-shapes/issues/161
  if ( navigator.userAgent.indexOf( 'Firefox/' ) >= 0 &&
       navigator.userAgent.match( /OS X 10\.1[0123]/ ) ) {
    hasBasicWebGLSupport = false;
  }

  const useWebGL = hasBasicWebGLSupport && ( !platform.ie11 || Utils.checkIE11StencilSupport() );

  return merge( MoleculeShapesGlobals, {
    // @public {Property.<boolean>} - Whether the basics of WebGL are included
    hasBasicWebGLSupportProperty: new Property( hasBasicWebGLSupport ),

    // @public {Property.<boolean>} - Whether we will be using WebGL
    useWebGLProperty: new Property( useWebGL ),

    /**
     * Applies color changes to the material's color field, and also does so immediately upon being called.
     * @public
     *
     * @param {THREE.Material} material
     * @param {Property.<Color>} colorProperty
     * @returns A callback that will unlink
     */
    linkColor: function( material, colorProperty ) {
      const colorListener = function( color ) {
        material.color.setHex( color.toNumber() );
      };
      colorProperty.link( colorListener );
      return function() {
        colorProperty.unlink( colorListener );
      };
    },

    /**
     * Creates a color Property from anything that can be provided to Scenery as a constant-color fill/stroke.
     * @public
     *
     * @param {string | Color | Property.<Color>} color
     * @returns {Property.<Color>}
     */
    toColorProperty: function( color ) {
      // for now, cast it into place
      let colorProperty;
      if ( typeof color === 'string' ) {
        color = new Color( color );
      }
      if ( color instanceof Color ) {
        colorProperty = new Property( color );
      }
      else if ( color instanceof Property ) {
        colorProperty = color;
      }
      else {
        throw new Error( 'bad color passed to MoleculeShapesGlobals.toColorProperty' );
      }
      return colorProperty;
    }
  } );
} );