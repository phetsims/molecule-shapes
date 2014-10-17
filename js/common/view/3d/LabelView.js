// Copyright 2002-2014, University of Colorado Boulder

/**
 * Label (text) of the angle between two bonds
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Util = require( 'SCENERY/util/Util' );
  var Shape = require( 'KITE/Shape' );
  var LiberationSansRegularSubset = require( 'MOLECULE_SHAPES/common/data/LiberationSansRegularSubset' );
  // var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  // TODO: colors

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

  // context.fillStyle = 'black';
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

  var texture = THREE.ImageUtils.loadTexture( canvas.toDataURL() );
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  function LabelView() {
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
    x += glyphs['.'].advance * 0.7;

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
    x += glyphs['°'].advance;

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

    THREE.Mesh.call( this, geometry, new THREE.MeshBasicMaterial( {
      // color: 0x0000ff,
      map: texture,
      side: THREE.DoubleSide
    } ) );

    this.scale.x = this.scale.y = this.scale.z = 0.15 * 1 * 0.7;
    this.position.x = 200;
    this.position.y = 200;

    this.setGlyph( 0, '1' );
    this.setGlyph( 1, '8' );
    this.setGlyph( 2, '0' );
    this.setGlyph( 3, '.' );
    this.setGlyph( 4, '0' );
    this.setGlyph( 5, '°' );
  }

  return inherit( THREE.Mesh, LabelView, {
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
    }
  } );
} );