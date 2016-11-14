// Copyright 2014-2015, University of Colorado Boulder

/**
 * Global settings and quality information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesQueryParameters = require( 'MOLECULE_SHAPES/common/MoleculeShapesQueryParameters' );
  var platform = require( 'PHET_CORE/platform' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );

  var MoleculeShapesGlobals = new PropertySet( {
    showOuterLonePairs: MoleculeShapesQueryParameters.showOuterLonePairs,
    projectorColors: ( MoleculeShapesQueryParameters.colorProfile === 'projector' )
  } );
  moleculeShapes.register( 'MoleculeShapesGlobals', MoleculeShapesGlobals );

  // polyfill for console.log on IE9, see https://github.com/phetsims/molecule-shapes/issues/108
  if ( platform.ie9 ) {
    window.console = window.console || {};
    window.console.log = window.console.log || function() {};
  }

  var hasBasicWebGLSupport = MoleculeShapesQueryParameters.webgl && Util.isWebGLSupported;
  var useWebGL = hasBasicWebGLSupport && ( !platform.ie11 || Util.checkIE11StencilSupport() );

  return _.extend( MoleculeShapesGlobals, {
    // @public {boolean} - Whether the basics of WebGL are included
    hasBasicWebGLSupport: hasBasicWebGLSupport,

    // @public {boolean} - Whether we will be using WebGL
    useWebGL: useWebGL,

    /**
     * Applies color changes to the material's color field, and also does so immediately upon being called.
     * @public
     *
     * @param {THREE.Material} material
     * @param {Property.<Color>} colorProperty
     * @returns A callback that will unlink
     */
    linkColor: function( material, colorProperty ) {
      var colorListener = function( color ) {
        material.color.setHex( color.toNumber() );
      };
      colorProperty.link( colorListener );
      return function() {
        colorProperty.unlink( colorListener );
      };
    },

    /**
     * Creates a color property from anything that can be provided to Scenery as a constant-color fill/stroke.
     * @public
     *
     * @param {string | Color | Property.<Color>} color
     * @returns {Property.<Color>}
     */
    toColorProperty: function( color ) {
      // for now, cast it into place
      var colorProperty;
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