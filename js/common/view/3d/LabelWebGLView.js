// Copyright 2014-2022, University of Colorado Boulder

/**
 * Label (text) of the angle between two bonds. We restrict the possible input strings to the form '123.4°' or '12.3°'
 * to make the layout faster (no need to change the geometry vertices, just UVs) and simpler.
 *
 * At a high level, we create a texture (image) with the glyphs we will need positioned evenly-spaced on it. We
 * specify constant geometry positions for each character (there are 6 for '123.4°'), since we have no need to change
 * the positions of those due to our format string restrictions (for '12.3°', we simply don't display the first
 * character, e.g. 'X12.3°'). We update the UV coordinates for each character's position to correspond to the position
 * inside the texture where the desired glyph is.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import { Utils } from '../../../../../scenery/js/imports.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import LocalTexture from './LocalTexture.js';

// grab our font data from the global namespace
const liberationSansRegularSubset = phet.liberationSansRegularSubsetNumericDegrees;
assert && assert( liberationSansRegularSubset );

/*---------------------------------------------------------------------------*
 * Glyph texture setup
 *----------------------------------------------------------------------------*/

const glyphs = {};
let maxWidth;
let maxHeight;
let canvas;
// initializes the above variables with a texture image and data to reference where glyphs are in that texture
( function setupTexture() {
  const padding = 4; // padding between glyphs in the texture, and between glyphs and the outside
  let numGlyphs = 0; // auto-detect number of glyphs, so we can space the glyphs out in the texture
  const glyphScale = 130; // 65 * powers of 2 seems to fill out the power-of-2 texture wasting less space
  const scaleMatrix = Matrix3.scaling( glyphScale );
  let key;

  // compute maxBounds, set glyphs[key].{shape,advance}
  const maxBounds = Bounds2.NOTHING.copy();
  for ( key in liberationSansRegularSubset ) {
    numGlyphs++;

    const fontGlyph = liberationSansRegularSubset[ key ];
    const shape = new Shape( fontGlyph.path ).transformed( scaleMatrix );
    maxBounds.includeBounds( shape.bounds );

    glyphs[ key ] = {
      advance: fontGlyph.x_advance * glyphScale,
      shape: shape
    };
  }

  // export maximum dimensions needed for layer layout
  maxWidth = maxBounds.width;
  maxHeight = maxBounds.height;

  // set up Canvas and dimensions (padding between all glyphs and around the outside, rounded out to powers of 2)
  canvas = document.createElement( 'canvas' );
  const context = canvas.getContext( '2d' );
  const canvasWidth = Utils.toPowerOf2( ( numGlyphs + 1 ) * padding + numGlyphs * maxWidth );
  const canvasHeight = Utils.toPowerOf2( 2 * padding + maxHeight );
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // draw the glyphs into the texture, while recording their coordinate bounds in UV space (0 to 1)
  let n = 0;
  for ( key in liberationSansRegularSubset ) {
    // X,Y offset of the glyph's 0,0 registration point
    const xOffset = ( n + 1 ) * padding + n * maxWidth - maxBounds.minX;
    const yOffset = padding + maxHeight - maxBounds.maxY;
    context.setTransform( 1, 0, 0, 1, xOffset, yOffset );
    // Bounds in the texture are offset from the X,Y. We scale to [0,1] since that's how texture coordinates are handled
    glyphs[ key ].bounds = new Bounds2( ( xOffset + maxBounds.minX ) / canvasWidth,
      ( yOffset + maxBounds.minY ) / canvasHeight,
      ( xOffset + maxBounds.maxX ) / canvasWidth,
      ( yOffset + maxBounds.maxY ) / canvasHeight );
    // draw it in white over transparency
    context.fillStyle = 'white';
    context.beginPath();
    glyphs[ key ].shape.writeToContext( context );
    context.fill();

    glyphs[ key ].xOffset = xOffset;
    glyphs[ key ].yOffset = yOffset;
    n++;
  }
} )();

// renderer-local access
const localTexture = new LocalTexture( () => {
  const texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  texture.minFilter = THREE.LinearMipMapLinearFilter; // ensure we have the best-quality mip-mapping
  return texture;
} );

// metrics data for proper centering and layout
const FORMAT_STRING = '000.0°';
const shortXOffset = glyphs[ '0' ].advance;
const shortWidth = 3 * glyphs[ '0' ].advance + glyphs[ '.' ].advance + glyphs[ '°' ].advance;
const longWidth = glyphs[ '0' ].advance + shortWidth;

/*---------------------------------------------------------------------------*
 * Text shader
 *----------------------------------------------------------------------------*/

const vertexShader = [
  'varying vec2 vUv;',

  'void main() {',
  '  vUv = uv;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
  '}'
].join( '\n' );

// custom fragment shader that rescales the text to increase contrast, and allows color and opacity controls
const fragmentShader = [
  'varying vec2 vUv;',
  'uniform sampler2D map;',
  'uniform float opacity;',
  'uniform vec3 color;',
  'const float scaleCenter = 0.4;',

  'void main() {',
  '  vec4 texLookup = texture2D( map, vUv );',
  '  float rescaled = ( texLookup.r - scaleCenter ) * 2.0 + scaleCenter;',
  '  gl_FragColor = vec4( color, opacity * clamp( rescaled, 0.0, 1.0 ) );',
  '}'
].join( '\n' );

// This uses three.js's uniform format and types, see https://github.com/mrdoob/three.js/wiki/Uniforms-types
const materialUniforms = {
  map: {
    type: 't',
    value: null // stub value, will be filled in
  },
  opacity: {
    type: 'f',
    value: 0
  },
  color: {
    type: '3f'
  }
};

class LabelWebGLView extends THREE.Mesh {
  /*
   * @param {THREE.Renderer} renderer
   */
  constructor( renderer ) {

    const uvs = [];

    const texture = localTexture.get( renderer );

    const geometry = new THREE.Geometry();
    let x = 0; // accumulated X offset of previous character places

    for ( let i = 0; i < FORMAT_STRING.length; i++ ) {
      // vertices for the bounds of the character
      geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
      geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
      geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
      geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
      x += glyphs[ FORMAT_STRING[ i ] ].advance;

      // push UV placeholders for each corner
      uvs.push( new THREE.Vector3() );
      uvs.push( new THREE.Vector3() );
      uvs.push( new THREE.Vector3() );
      uvs.push( new THREE.Vector3() );

      // two faces to make up the quad for the character
      const offset = 4 * i;
      geometry.faces.push( new THREE.Face3( offset, offset + 1, offset + 2 ) );
      geometry.faceVertexUvs[ 0 ].push( [ uvs[ offset ], uvs[ offset + 1 ], uvs[ offset + 2 ] ] );
      geometry.faces.push( new THREE.Face3( offset, offset + 2, offset + 3 ) );
      geometry.faceVertexUvs[ 0 ].push( [ uvs[ offset ], uvs[ offset + 2 ], uvs[ offset + 3 ] ] );
    }

    geometry.dynamic = true; // tells three.js that we will change things
    geometry.uvsNeedUpdate = true; // will need when we change UVs
    // @private {Object} - cheap deep copy
    const specificMaterialUniforms = JSON.parse( JSON.stringify( materialUniforms ) );
    specificMaterialUniforms.map.value = texture;

    MoleculeShapesColors.bondAngleReadoutProperty.link( color => {
      specificMaterialUniforms.color.value = [ color.r / 255, color.g / 255, color.b / 255 ]; // uniforms use number arrays
    } );

    const material = MoleculeShapesGlobals.useWebGLProperty.value ? new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: specificMaterialUniforms
    } ) : new THREE.MeshBasicMaterial( { // NOTE: not great Canvas appearance. May have performance penalties
      side: THREE.DoubleSide,
      transparent: true,
      map: texture
    } );

    super( geometry, material );

    this.uvs = uvs; // @private {Array.<THREE.Vector3>} - stores the texture coordinates used for drawing

    // @private {Object} - cheap deep copy
    this.materialUniforms = specificMaterialUniforms;

    this.unsetLabel();
  }

  /*
   * Displays and positions the label, and sets its text.
   * Same as API for LabelFallbackNode
   * @public
   *
   * @param {string} string
   * @param {number} brightness - In range [0,1]
   * @param {Vector2} centerScreenPoint - The center of the central atom in screen coordinates
   * @param {Vector2} midScreenPoint - The midpoint of the bond-angle arc in screen coordinates
   * @param {number} layoutScale - The ScreenView's layout scale
   */
  setLabel( string, brightness, centerScreenPoint, midScreenPoint, layoutScale ) {
    assert && assert( string.length === 5 || string.length === 6 );

    this.setString( string );
    this.materialUniforms.opacity.value = brightness;

    const scale = layoutScale * 0.13; // tuned constant to match the desired "font size" of the label
    this.scale.x = this.scale.y = this.scale.z = scale;

    const xCentering = string.length === 6 ? -longWidth / 2 : -shortXOffset - shortWidth / 2;
    const yCentering = -maxHeight / 2;

    // we position based on our upper-left origin
    const offset = midScreenPoint.minus( centerScreenPoint );
    // Mutably construct offset amount. Magic number vector is tuned to correspond well with the extra horizontal
    // and vertical spacing needed (if it wasn't applied, our text would be centered on the actual arc instead of
    // being pushed farther away).
    const offsetAmount = offset.normalized().componentMultiply( new Vector2( 0.38, 0.2 ) ).magnitude;
    this.position.x = midScreenPoint.x + offset.x * offsetAmount + xCentering * scale;
    this.position.y = midScreenPoint.y + offset.y * offsetAmount + yCentering * scale;
  }

  /*
   * Makes the label invisible
   * Same as API for LabelFallbackNode
   * @public
   */
  unsetLabel() {
    this.materialUniforms.opacity.value = 0;
  }

  /**
   * Sets the UV coordinates to display the requested string
   * @private
   *
   * @param {string} string
   */
  setString( string ) {
    let idx = 0;
    if ( string.length === 6 ) {
      this.setGlyph( 0, string[ idx++ ] );
    }
    else {
      this.unsetGlyph( 0 );
    }
    this.setGlyph( 1, string[ idx++ ] );
    this.setGlyph( 2, string[ idx++ ] );
    this.setGlyph( 3, string[ idx++ ] );
    this.setGlyph( 4, string[ idx++ ] );
    this.setGlyph( 5, string[ idx++ ] );
  }

  /**
   * Sets the UV coordinates for a single glyph, 0-indexed
   * @private
   *
   * @param {number} index
   * @param {string} string
   */
  setGlyph( index, string ) {
    assert && assert( glyphs[ string ] );

    const glyph = glyphs[ string ];
    const minU = glyph.bounds.minX;
    const maxU = glyph.bounds.maxX;
    const minV = 1 - glyph.bounds.maxY;
    const maxV = 1 - glyph.bounds.minY;

    this.setUVs( index, minU, minV, maxU, maxV );
  }

  /**
   * Makes the character at the index invisible.
   * @private
   *
   * @param {number} index
   */
  unsetGlyph( index ) {
    // set all texture coordinates to 0, so it will display nothing
    this.setUVs( index, 0, 0, 0, 0 );
  }

  /**
   * Sets UVs for a specific character.
   * @private
   *
   * @param {number} index
   * @param {number} minU
   * @param {number} minV
   * @param {number} maxU
   * @param {number} maxV
   */
  setUVs( index, minU, minV, maxU, maxV ) {
    const offset = index * 4;

    this.uvs[ offset ].x = minU;
    this.uvs[ offset ].y = maxV;
    this.uvs[ offset + 1 ].x = maxU;
    this.uvs[ offset + 1 ].y = maxV;
    this.uvs[ offset + 2 ].x = maxU;
    this.uvs[ offset + 2 ].y = minV;
    this.uvs[ offset + 3 ].x = minU;
    this.uvs[ offset + 3 ].y = minV;
    this.geometry.uvsNeedUpdate = true; // will need when we change UVs
  }
}

moleculeShapes.register( 'LabelWebGLView', LabelWebGLView );

export default LabelWebGLView;
