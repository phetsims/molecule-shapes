// Copyright 2002-2014, University of Colorado Boulder

/**
 * Label (text) of the angle between two bonds. We restrict the possible input strings to the form '123.4°' or '12.3°'
 * to make the layout faster (no need to change the geometry vertices, just UVs) and simpler.
 *
 * At a high level, we create a texture (image) with the glyphs we will need positioned evenly-spaced on it. We
 * specify constant geometry positions for each character (there are 6 for '123.4°'), since we have no need to change
 * the positions of those due to our format string restrictions (for '12.3°', we simply don't display the first
 * character, e.g. 'X12.3°'). We update the UV coordinates for each character's position to correspond to the location
 * inside the texture where the desired glyph is.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Util = require( 'SCENERY/util/Util' );
  var Shape = require( 'KITE/Shape' );
  var LiberationSansRegularSubset = require( 'MOLECULE_SHAPES/common/data/LiberationSansRegularSubset' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var LocalTexture = require( 'MOLECULE_SHAPES/common/view/3d/LocalTexture' );

  /*---------------------------------------------------------------------------*
  * Glyph texture setup
  *----------------------------------------------------------------------------*/

  var glyphs = {};
  var maxWidth;
  var maxHeight;
  var dataURL;
  // initializes the above variables with a texture image and data to reference where glyphs are in that texture
  (function setupTexture() {
    var padding = 4; // padding between glyphs in the texture, and between glyphs and the outside
    var numGlyphs = 0; // auto-detect number of glyphs, so we can space the glyphs out in the texture
    var glyphScale = 130; // 65 * powers of 2 seems to fill out the power-of-2 texture wasting less space
    var scaleMatrix = Matrix3.scaling( glyphScale );
    var key;

    // compute maxBounds, set glyphs[key].{shape,advance}
    var maxBounds = Bounds2.NOTHING.copy();
    for ( key in LiberationSansRegularSubset ) {
      numGlyphs++;

      var fontGlyph = LiberationSansRegularSubset[key];
      var shape = new Shape( fontGlyph.path ).transformed( scaleMatrix )  ;
      maxBounds.includeBounds( shape.bounds );

      glyphs[key] = {
        advance: fontGlyph.x_advance * glyphScale,
        shape: shape
      };
    }

    // export maximum dimensions needed for layer layout
    maxWidth = maxBounds.width;
    maxHeight = maxBounds.height;

    // set up Canvas and dimensions (padding between all glyphs and around the outside, rounded out to powers of 2)
    var canvas = document.createElement( 'canvas' );
    var context = canvas.getContext( '2d' );
    var canvasWidth = Util.toPowerOf2( ( numGlyphs + 1 ) * padding + numGlyphs * maxWidth );
    var canvasHeight = Util.toPowerOf2( 2 * padding + maxHeight );
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // draw the glyphs into the texture, while recording their coordinate bounds in UV space (0 to 1)
    var n = 0;
    for ( key in LiberationSansRegularSubset ) {
      // X,Y offset of the glyph's 0,0 registration point
      var xOffset = ( n + 1 ) * padding + n * maxWidth - maxBounds.minX;
      var yOffset = padding + maxHeight - maxBounds.maxY;
      context.setTransform( 1, 0, 0, 1, xOffset, yOffset );
      // Bounds in the texture are offset from the X,Y. We scale to [0,1] since that's how texture coordinates are handled
      glyphs[key].bounds = new Bounds2( ( xOffset + maxBounds.minX ) / canvasWidth,
                                        ( yOffset + maxBounds.minY ) / canvasHeight,
                                        ( xOffset + maxBounds.maxX ) / canvasWidth,
                                        ( yOffset + maxBounds.maxY ) / canvasHeight );
      // draw it in white over transparency
      context.fillStyle = 'white';
      context.beginPath();
      glyphs[key].shape.writeToContext( context );
      context.fill();

      glyphs[key].xOffset = xOffset;
      glyphs[key].yOffset = yOffset;
      n++;
    }

    // the URL containing the texture
    dataURL = canvas.toDataURL();
  })();

  // renderer-local access
  var localTexture = new LocalTexture( function() {
    var texture = THREE.ImageUtils.loadTexture( dataURL );
    texture.minFilter = THREE.LinearMipMapLinearFilter; // ensure we have the best-quality mip-mapping
    return texture;
  } );

  // metrics data for proper centering and layout
  var formatString = '000.0°';
  var shortXOffset = glyphs['0'].advance;
  var shortWidth = 3 * glyphs['0'].advance + glyphs['.'].advance + glyphs['°'].advance;
  var longWidth = glyphs['0'].advance + shortWidth;

  /*---------------------------------------------------------------------------*
  * Text shader
  *----------------------------------------------------------------------------*/

  var vertexShader = [
    'varying vec2 vUv;',

    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join( '\n' );

  // custom fragment shader that rescales the text to increase contrast, and allows color and opacity controls
  var fragmentShader = [
    'varying vec2 vUv;',
    'uniform sampler2D map;',
    'uniform float opacity;',
    'uniform vec3 color;',
    'const float scaleCenter = 0.4;',

    'void main() {',
    '  vec4 texLookup = texture2D( map, vUv );',
    '  float rescaled = ( texLookup.r - scaleCenter ) * 2.0 + scaleCenter;',
    '  gl_FragColor = vec4( color, opacity * clamp( rescaled, 0.0, 1.0 ) );',
    // '  gl_FragColor = vec4( vUv, 0.0, 1.0 );',
    '}'
  ].join( '\n' );

  var materialUniforms = {
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

  /*
   * @constructor
   * @param {THREE.Renderer} renderer
   */
  function LabelWebGLView( renderer ) {
    var view = this;

    this.uvs = []; // {THREE.Vector3[]} - stores the texture coordinates used for drawing

    var texture = localTexture.get( renderer );

    var geometry = new THREE.Geometry();
    var x = 0; // accumulated X offset of previous character places

    for ( var i = 0; i < formatString.length; i++ ) {
      // vertices for the bounds of the character
      geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
      geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
      geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
      geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
      x += glyphs[formatString[i]].advance;

      // push UV placeholders for each corner
      this.uvs.push( new THREE.Vector3() );
      this.uvs.push( new THREE.Vector3() );
      this.uvs.push( new THREE.Vector3() );
      this.uvs.push( new THREE.Vector3() );

      // two faces to make up the quad for the character
      var offset = 4 * i;
      geometry.faces.push( new THREE.Face3( offset, offset + 1, offset + 2 ) );
      geometry.faceVertexUvs[0].push( [this.uvs[offset], this.uvs[offset + 1], this.uvs[offset + 2]] );
      geometry.faces.push( new THREE.Face3( offset, offset + 2, offset + 3 ) );
      geometry.faceVertexUvs[0].push( [this.uvs[offset], this.uvs[offset + 2], this.uvs[offset + 3]] );
    }

    geometry.dynamic = true; // tells three.js that we will change things
    geometry.uvsNeedUpdate = true; // will need when we change UVs

    this.materialUniforms = JSON.parse( JSON.stringify( materialUniforms ) ); // cheap deep copy
    this.materialUniforms.map.value = texture;

    MoleculeShapesColors.link( 'bondAngleReadout', function( color ) {
      view.materialUniforms.color.value = [color.r / 255, color.g / 255, color.b / 255]; // uniforms use number arrays
    } );

    var material = MoleculeShapesGlobals.useWebGL ? new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: this.materialUniforms
    } ) : new THREE.MeshBasicMaterial( { // NOTE: not great Canvas appearance. May have performance penalties
      side: THREE.DoubleSide,
      transparent: true,
      map: texture
    } );

    THREE.Mesh.call( this, geometry, material );
  }

  return inherit( THREE.Mesh, LabelWebGLView, {
    /*
     * Displays and positions the label, and sets its text.
     *
     * @param {string} string
     * @param {number} brightness - In range [0,1]
     * @param {Vector2} centerScreenPoint - The center of the central atom in screen coordinates
     * @param {Vector2} midScreenPoint - The midpoint of the bond-angle arc in screen coordinates
     * @param {number} layoutScale - The ScreenView's layout scale
     */
    setLabel: function( string, brightness, centerScreenPoint, midScreenPoint, layoutScale ) {
      assert && assert( string.length === 5 || string.length === 6 );

      this.setString( string );
      this.materialUniforms.opacity.value = brightness;

      var scale = layoutScale * 0.13; // tuned constant to match the desired "font size" of the label
      this.scale.x = this.scale.y = this.scale.z = scale;

      var xCentering = string.length === 6 ? -longWidth / 2 : -shortXOffset - shortWidth / 2;
      var yCentering = -maxHeight / 2;

      // we position based on our upper-left origin
      var offset = midScreenPoint.minus( centerScreenPoint );
      // Mutably construct offset amount. Magic number vector is tuned to correspond well with the extra horizontal
      // and vertical spacing needed (if it wasn't applied, our text would be centered on the actual arc instead of
      // being pushed farther away).
      var offsetAmount = offset.normalized().componentMultiply( new Vector2( 0.38, 0.2 ) ).magnitude();
      this.position.x = midScreenPoint.x + offset.x * offsetAmount + xCentering * scale;
      this.position.y = midScreenPoint.y + offset.y * offsetAmount + yCentering * scale;
    },

    /*
     * Makes the label invisible
     */
    unsetLabel: function() {
      this.materialUniforms.opacity.value = 0;
    },

    // @private - sets the UV coordinates to display the requested string
    setString: function( string ) {
      var idx = 0;
      if ( string.length === 6 ) {
        this.setGlyph( 0, string[idx++] );
      } else {
        this.unsetGlyph( 0 );
      }
      this.setGlyph( 1, string[idx++] );
      this.setGlyph( 2, string[idx++] );
      this.setGlyph( 3, string[idx++] );
      this.setGlyph( 4, string[idx++] );
      this.setGlyph( 5, string[idx++] );
    },

    // @private - sets the UV coordinates for a single glyph, 0-indexed
    setGlyph: function( index, string ) {
      assert && assert( glyphs[string] );

      var glyph = glyphs[string];
      var minU = glyph.bounds.minX;
      var maxU = glyph.bounds.maxX;
      var minV = 1 - glyph.bounds.maxY;
      var maxV = 1 - glyph.bounds.minY;

      this.setUVs( index, minU, minV, maxU, maxV );
    },

    // @private - makes the character at the index invisible
    unsetGlyph: function( index ) {
      // set all texture coordinates to 0, so it will display nothing
      this.setUVs( index, 0, 0, 0, 0 );
    },

    // @private - sets UVs for a specific character
    setUVs: function( index, minU, minV, maxU, maxV ) {
      var offset = index * 4;

      this.uvs[offset].x = minU;
      this.uvs[offset].y = maxV;
      this.uvs[offset + 1].x = maxU;
      this.uvs[offset + 1].y = maxV;
      this.uvs[offset + 2].x = maxU;
      this.uvs[offset + 2].y = minV;
      this.uvs[offset + 3].x = minU;
      this.uvs[offset + 3].y = minV;
      this.geometry.uvsNeedUpdate = true; // will need when we change UVs
    }
  } );
} );