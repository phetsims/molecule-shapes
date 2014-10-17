// Copyright 2002-2014, University of Colorado Boulder

/**
 * Label (text) of the angle between two bonds
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
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var LocalTexture = require( 'MOLECULE_SHAPES/common/view/3d/LocalTexture' );

  var padding = 4;
  var glyphs = {};
  var numGlyphs = 0;

  var minX = Number.POSITIVE_INFINITY;
  var maxX = Number.NEGATIVE_INFINITY;
  var minY = Number.POSITIVE_INFINITY;
  var maxY = Number.NEGATIVE_INFINITY;

  var glyphScale = 130 / 1;

  var scaleMatrix = Matrix3.scaling( glyphScale );

  var key;

  for ( key in LiberationSansRegularSubset ) {
    numGlyphs++;

    var entry = LiberationSansRegularSubset[key];

    var shape = new Shape( entry.path ).transformed( scaleMatrix )  ;

    minX = Math.min( minX, shape.bounds.minX );
    maxX = Math.max( maxX, shape.bounds.maxX );
    minY = Math.min( minY, shape.bounds.minY );
    maxY = Math.max( maxY, shape.bounds.maxY );

    glyphs[key] = {
      advance: entry.x_advance * glyphScale,
      shape: shape
    };
  }

  var maxWidth = maxX - minX;
  var maxHeight = maxY - minY;

  var canvas = document.createElement( 'canvas' );
  var context = canvas.getContext( '2d' );

  var canvasWidth = Util.toPowerOf2( ( numGlyphs + 1 ) * padding + numGlyphs * maxWidth );
  var canvasHeight = Util.toPowerOf2( 2 * padding + maxHeight );

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // context.fillStyle = 'red';
  // context.fillRect( 0, 0, canvasWidth, canvasHeight );

  var exports = {};

  var n = 0;
  for ( key in LiberationSansRegularSubset ) {
    var xOffset = ( n + 1 ) * padding + n * maxWidth - minX;
    var yOffset = padding + maxHeight - maxY;
    context.setTransform( 1, 0, 0, 1, xOffset, yOffset );
    glyphs[key].bounds = new Bounds2( ( xOffset + minX ) / canvasWidth,
                                      ( yOffset + minY ) / canvasHeight,
                                      ( xOffset + maxX ) / canvasWidth,
                                      ( yOffset + maxY ) / canvasHeight );
    // context.strokeStyle = 'red';
    // context.strokeRect( minX, minY, maxWidth, maxHeight );
    context.fillStyle = 'white';
    context.beginPath();
    glyphs[key].shape.writeToContext( context );
    context.fill();

    glyphs[key].xOffset = xOffset;
    glyphs[key].yOffset = yOffset;
    n++;

    exports[key] = {
      minX: glyphs[key].bounds.minX,
      maxX: glyphs[key].bounds.maxX,
      minY: glyphs[key].bounds.minY,
      maxY: glyphs[key].bounds.maxY,
      advance: glyphs[key].advance
    };
  }

  var localTexture = new LocalTexture( function() {
    var texture = THREE.ImageUtils.loadTexture( canvas.toDataURL() );
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    return texture;
  } );

  var periodCompensationFactor = 0.7;
  var shortXOffset = glyphs['0'].advance;
  var shortWidth = 3 * glyphs['0'].advance + glyphs['.'].advance * periodCompensationFactor + glyphs['°'].advance * periodCompensationFactor;
  var longWidth = glyphs['0'].advance + shortWidth;

  function LabelView( renderer ) {
    var view = this;

    var texture = localTexture.get( renderer );

    var geometry = new THREE.Geometry();
    var x = 0;

    // glyph 0
    geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
    x += glyphs['0'].advance;

    // glyph 1
    geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
    x += glyphs['0'].advance;

    // glyph 2
    geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
    x += glyphs['0'].advance;

    // glyph 3
    geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
    x += glyphs['.'].advance * periodCompensationFactor;

    // glyph 4
    geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
    x += glyphs['0'].advance;

    // glyph 5
    geometry.vertices.push( new THREE.Vector3( x, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + maxWidth, maxHeight, 0 ) );
    geometry.vertices.push( new THREE.Vector3( x + 0, maxHeight, 0 ) );
    x += glyphs['°'].advance * periodCompensationFactor;

    this.uvs = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),

      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),

      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),

      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),

      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),

      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ];

    for ( var i = 0; i < 6; i++ ) {
      var offset = 4 * i;
      geometry.faces.push( new THREE.Face3( offset, offset + 1, offset + 2 ) );
      geometry.faceVertexUvs[0].push( [this.uvs[offset], this.uvs[offset + 1], this.uvs[offset + 2]] );
      geometry.faces.push( new THREE.Face3( offset, offset + 2, offset + 3 ) );
      geometry.faceVertexUvs[0].push( [this.uvs[offset], this.uvs[offset + 2], this.uvs[offset + 3]] );
    }

    geometry.dynamic = true;
    geometry.uvsNeedUpdate = true; // will need when we change UVs

    var vertexShader = [
      'varying vec2 vUv;',

      'void main() {',
      '  vUv = uv;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'
    ].join( '\n' );

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

    this.materialUniforms = {
      map: {
        type: 't',
        value: texture
      },
      opacity: {
        type: 'f',
        value: 1
      },
      color: {
        type: '3f'
      }
    };

    MoleculeShapesColors.link( 'bondAngleReadout', function( color ) {
      view.materialUniforms.color.value = [color.r / 255, color.g / 255, color.b / 255];
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

    this.position.x = 200;
    this.position.y = 200;
  }

  return inherit( THREE.Mesh, LabelView, {
    setLabel: function( string, brightness, centerScreenPoint, midScreenPoint, layoutScale ) {
      this.setString( string );
      this.materialUniforms.opacity.value = brightness;

      var scale = layoutScale * 0.13;
      this.scale.x = this.scale.y = this.scale.z = scale;
      var xCentering = string.length === 6 ? -longWidth / 2 : -shortXOffset - shortWidth / 2;
      var yCentering = -maxHeight / 2;

      // we position based on our upper-left origin
      var offset = midScreenPoint.minus( centerScreenPoint );
      // mutably construct offset amount
      var offsetAmount = offset.normalized().componentMultiply( new Vector2( 0.35, 0.2 ) ).magnitude();
      this.position.x = midScreenPoint.x + offset.x * offsetAmount + xCentering * scale;
      this.position.y = midScreenPoint.y + offset.y * offsetAmount + yCentering * scale;
    },

    unsetLabel: function() {
      this.materialUniforms.opacity.value = 0;
    },

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

    setGlyph: function( index, string ) {
      var offset = index * 4;

      var glyph = exports[string];
      var minU = glyph.minX;
      var maxU = glyph.maxX;
      var minV = 1 - glyph.maxY;
      var maxV = 1 - glyph.minY;

      this.uvs[offset].x = minU;
      this.uvs[offset].y = maxV;
      this.uvs[offset + 1].x = maxU;
      this.uvs[offset + 1].y = maxV;
      this.uvs[offset + 2].x = maxU;
      this.uvs[offset + 2].y = minV;
      this.uvs[offset + 3].x = minU;
      this.uvs[offset + 3].y = minV;
      this.geometry.uvsNeedUpdate = true; // will need when we change UVs
    },

    unsetGlyph: function( index ) {
      var offset = index * 4;

      this.uvs[offset].x = 0;
      this.uvs[offset].y = 0;
      this.uvs[offset + 1].x = 0;
      this.uvs[offset + 1].y = 0;
      this.uvs[offset + 2].x = 0;
      this.uvs[offset + 2].y = 0;
      this.uvs[offset + 3].x = 0;
      this.uvs[offset + 3].y = 0;
      this.geometry.uvsNeedUpdate = true; // will need when we change UVs
    }
  } );
} );