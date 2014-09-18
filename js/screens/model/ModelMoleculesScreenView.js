//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var Display = require( 'MOBIUS/Display' );
  var ShaderProgram = require( 'MOBIUS/ShaderProgram' );

  /**
   * Constructor for the ModelMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function ModelMoleculesScreenView( model ) {
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 1024, 618 )
    } );

    var display = this.display = new Display();

    // correctly position it for our uses
    display.canvas.style.position = 'absolute';
    display.canvas.style.top = '0';
    display.canvas.style.left = '0';

    var gl = this.gl = display.gl;
    var shaderProgram = this.shaderProgram = new ShaderProgram( gl,
      // vertex shader
      'attribute vec3 vertex;\n' +
      'varying vec2 texCoord;\n' +
      'void main() {\n' +
      '  texCoord = vertex.xy * 0.5 + 0.5;\n' +
      '  gl_Position = vec4( vertex, 1 );\n' +
      '}',

      // fragment shader
      'precision highp float;\n' +
      'varying vec2 texCoord;\n' +
      'uniform float red;\n' +
      'void main() {\n' +
      '  gl_FragColor = vec4( red, texCoord.x, texCoord.y, 1 );\n' +
      '}',

      ['vertex'], ['red'] );

    var vertexBuffer = this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
      -1, -1,
      -1, +1,
      +1, -1,
      +1, +1
    ] ), gl.STATIC_DRAW );

    var canvasNode = new DOM( display.canvas, {
      preventTransform: true
    } );
    canvasNode.updateCSSTransform = function(){}; // Scenery 0.1 override :()

    this.addChild( canvasNode );


    this.addChild( new ResetAllButton( { right: this.layoutBounds.maxX - 10, bottom: this.layoutBounds.maxY - 10 } ) );
  }

  return inherit( ScreenView, ModelMoleculesScreenView, {
    layout: function( width, height ) {
      ScreenView.prototype.layout.call( this, width, height );

      this.display.setSize( Math.ceil( width ), Math.ceil( height ) );
    },
    step: function( dt ) {
      this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

      this.display.switchToProgram( this.shaderProgram );
      // TODO: improved way of setting this uniform!
      this.gl.uniform1f( this.shaderProgram.uniformLocations.red, 1 );

      this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.vertexBuffer );
      this.gl.vertexAttribPointer( this.shaderProgram.attributeLocations.vertex, 2, this.gl.FLOAT, false, 0, 0 );
      this.gl.drawArrays( this.gl.TRIANGLE_STRIP, 0, 4 );
    }
  } );
} );
