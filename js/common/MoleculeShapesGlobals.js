// Copyright 2014-2022, University of Colorado Boulder

/**
 * Global settings and quality information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import merge from '../../../phet-core/js/merge.js';
import { Color, Utils } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import moleculeShapes from '../moleculeShapes.js';
import MoleculeShapesQueryParameters from './MoleculeShapesQueryParameters.js';
import MoleculeShapesColors from './view/MoleculeShapesColors.js';

const MoleculeShapesGlobals = {
  showOuterLonePairsProperty: new BooleanProperty( MoleculeShapesQueryParameters.showOuterLonePairs, {
    tandem: phet.chipper.packageObject.name === 'molecule-shapes-basics' ? Tandem.OPT_OUT : Tandem.PREFERENCES.createTandem( 'showOuterLonePairsProperty' )
  } ),

  checkboxOptions: {
    checkboxColor: MoleculeShapesColors.checkboxProperty,
    checkboxColorBackground: MoleculeShapesColors.checkboxBackgroundProperty
  }
};

moleculeShapes.register( 'MoleculeShapesGlobals', MoleculeShapesGlobals );

let hasBasicWebGLSupport = phet.chipper.queryParameters.webgl && Utils.isWebGLSupported;

// Check for the presence of a webgl/three.js bug present in https://github.com/phetsims/molecule-shapes/issues/161
if ( navigator.userAgent.indexOf( 'Firefox/' ) >= 0 &&
     navigator.userAgent.match( /OS X 10\.1[0123]/ ) ) {
  hasBasicWebGLSupport = false;
}

const useWebGL = hasBasicWebGLSupport && Utils.checkIE11StencilSupport();

merge( MoleculeShapesGlobals, {
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
   * @param {string|Color|Property.<Color>} color
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
    else if ( color instanceof ReadOnlyProperty ) {
      colorProperty = color;
    }
    else {
      throw new Error( 'bad color passed to MoleculeShapesGlobals.toColorProperty' );
    }
    return colorProperty;
  }
} );

export default MoleculeShapesGlobals;