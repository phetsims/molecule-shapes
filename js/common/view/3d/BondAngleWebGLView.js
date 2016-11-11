// Copyright 2014-2015, University of Colorado Boulder

/**
 * View of the angle (sector and arc) between two bonds. The sector is the filled-in area between two bonds, and the
 * arc is the line along the edge of the sector.
 *
 * This is an efficient but WebGL-specific implementation of the bond angles that can't be used with the Canvas fallback.
 *
 * NOTE: This does NOT include the text readout for the label
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var BondAngleView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleView' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalPool = require( 'MOLECULE_SHAPES/common/view/3d/LocalPool' );

  var RADIAL_VERTEX_COUNT = 24; // how many vertices to use along the view

  /*---------------------------------------------------------------------------*
   * Geometry for the sector and arc
   *----------------------------------------------------------------------------*/

  /*
   * Since we use a custom vertex shader for properly positioning and transforming our vertices, we ship our vertices
   * over in a non-standard coordinate system:
   * x: in the range [0,1], like a polar angle but scaled so 0 is at one bond direction and 1 is at the other bond direction.
   * y: the distance from the central atom (allows us to change the radius if needed)
   * z: ignored
   */

  function createSectorGeometry() {
    var geometry = new THREE.Geometry();

    // first vertex (0) at the center
    geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

    // the rest of the vertices (1 to RADIAL_VERTEX_COUNT) are radial
    for ( var i = 0; i < RADIAL_VERTEX_COUNT; i++ ) {
      var ratio = i / ( RADIAL_VERTEX_COUNT - 1 ); // from 0 to 1
      geometry.vertices.push( new THREE.Vector3( ratio, BondAngleView.radius, 0 ) );
    }

    // faces (1 less than the number of radial vertices)
    for ( var j = 0; j < RADIAL_VERTEX_COUNT - 1; j++ ) {
      // we use a fan approach, first vertex is always the first (center) vertex, the other two are radial
      geometry.faces.push( new THREE.Face3( 0, j + 1, j + 2 ) );
    }

    return geometry;
  }

  function createArcGeometry() {
    var geometry = new THREE.Geometry();

    // radial vertices only
    for ( var i = 0; i < RADIAL_VERTEX_COUNT; i++ ) {
      var ratio = i / ( RADIAL_VERTEX_COUNT - 1 ); // from 0 to 1
      geometry.vertices.push( new THREE.Vector3( ratio, BondAngleView.radius, 0 ) );
    }

    return geometry;
  }

  // handles to get renderer-specific copies of the geometry
  var localSectorGeometry = new LocalGeometry( createSectorGeometry() );
  var localArcGeometry = new LocalGeometry( createArcGeometry() );

  /*---------------------------------------------------------------------------*
   * GLSL Shader for the sector and arc
   *----------------------------------------------------------------------------*/

  /*
   * We use a vertex shader that allows us to modify the bond angle's start and end points in a much faster way
   * (by changing uniforms) rather than recomputing all of the points on the CPU and shipping that to the GPU every
   * frame.
   *
   * midpointUnit is a unit vector from the center of the atom to the midpoint of the bond view's arc, and planarUnit
   * is a unit vector perpendicular to midpointUnit such that they both form a basis for the plane of our view.
   */
  var vertexShader = [
    'uniform float angle;',
    'uniform vec3 midpointUnit;',
    'uniform vec3 planarUnit;',

    'void main() {',
    // Since our X coordinate is from [0,1], we map it to [-angle/2, angle/2] so that the midpoint (0.5) maps to
    // an angle of 0.
    '  float theta = ( position.x - 0.5 ) * angle;',
    // Use our basis vectors to compute the point
    '  vec3 location = position.y * ( cos( theta ) * midpointUnit + sin( theta ) * planarUnit );',
    // Standard THREE.js uniforms provided to transform the point into the correct place
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4( location, 1.0 );',
    '}'
  ].join( '\n' );

  var fragmentShader = [
    'uniform float opacity;',
    'uniform vec3 color;',

    'void main() {',
    '  gl_FragColor = vec4( color, opacity );',
    '}'
  ].join( '\n' );

  // "prototype" uniforms object. Deep copies will be made for each view since they need to change independently.
  // This uses three.js's uniform format and types, see https://github.com/mrdoob/three.js/wiki/Uniforms-types
  var uniforms = {
    opacity: {
      type: 'f',
      value: 0.5
    },
    color: {
      type: '3f',
      value: [ 1, 1, 1 ]
    },
    angle: {
      type: 'f',
      value: Math.PI / 2
    },
    midpointUnit: {
      type: '3f',
      value: [ 0, 1, 0 ]
    },
    planarUnit: {
      type: '3f',
      value: [ 1, 0, 0 ]
    }
  };

  /*
   * @constructor
   *
   * @param {THREE.Renderer} renderer
   */
  function BondAngleWebGLView( renderer ) {
    assert && assert( MoleculeShapesGlobals.useWebGL );
    BondAngleView.call( this );

    var self = this;

    this.renderer = renderer; // @private {THREE.Renderer}
    this.arcGeometry = localArcGeometry.get( renderer ); // @private {THREE.Geometry}
    this.sectorGeometry = localSectorGeometry.get( renderer ); // @private {THREE.Geometry}

    // @private {THREE.ShaderMaterial} - We require one material per view so we can change the uniforms independently.
    this.sectorMaterial = new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true, // render in three.js' transparency pass
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse( JSON.stringify( uniforms ) ) // cheap deep copy
    } );
    // set and update our color
    this.sweepColorListener = function( color ) {
      self.sectorMaterial.uniforms.color.value = [ color.r / 255, color.g / 255, color.b / 255 ];
    };
    MoleculeShapesColorProfile.bondAngleSweepProperty.link( this.sweepColorListener );

    // @private {THREE.ShaderMaterial} - We require one material per view so we can change the uniforms independently
    // NOTE: we don't seem to be able to use the same material for rendering both the sector and arc
    this.arcMaterial = new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true, // render in three.js' transparency pass
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse( JSON.stringify( uniforms ) ) // cheap deep copy
    } );
    // set and update our color
    this.arcColorListener = function( color ) {
      self.arcMaterial.uniforms.color.value = [ color.r / 255, color.g / 255, color.b / 255 ];
    };
    MoleculeShapesColorProfile.bondAngleArcProperty.link( this.arcColorListener );

    this.sectorView = new THREE.Mesh( this.sectorGeometry, this.sectorMaterial ); // @private {THREE.Mesh}
    this.arcView = new THREE.Line( this.arcGeometry, this.arcMaterial ); // @private {THREE.Mesh}

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;

    this.add( this.sectorView );
    this.add( this.arcView );
  }

  moleculeShapes.register( 'BondAngleWebGLView', BondAngleWebGLView );

  return inherit( BondAngleView, BondAngleWebGLView, {
    /*
     * @override
     * @public
     *
     * @param {MoleculeShapesScreenView} screenView - Some screen-space information and transformations are needed
     * @param {Property.<boolean>} showBondAnglesProperty
     * @param {Molecule} molecule
     * @param {PairGroup} aGroup
     * @param {PairGroup} bGroup
     * @param {LabelWebGLView | LabelFallbackNode} label
     */
    initialize: function( screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label ) {
      BondAngleView.prototype.initialize.call( this, screenView, showBondAnglesProperty, molecule, aGroup, bGroup, label );

      return this;
    },

    /**
     * Disposes this, so it goes to the pool and can be re-initialized.
     * @override
     * @public
     */
    dispose: function() {
      BondAngleView.prototype.dispose.call( this );

      BondAngleWebGLView.pool.put( this, this.renderer );
    },

    /**
     * @override
     * @public
     *
     * @param {Vector3} lastMidpoint - The midpoint of the last frame's bond angle arc, used to stabilize bond angles
     *                                 that are around ~180 degrees.
     * @param {Vector3} localCameraOrientation - A unit vector in the molecule's local coordiante space pointing
     *                                           to the camera.
     */
    updateView: function( lastMidpoint, localCameraOrientation ) {
      BondAngleView.prototype.updateView.call( this, lastMidpoint, localCameraOrientation );

      this.sectorMaterial.uniforms.opacity.value = this.viewOpacity * 0.5;
      this.arcMaterial.uniforms.opacity.value = this.viewOpacity * 0.7;

      this.sectorMaterial.uniforms.angle.value = this.viewAngle;
      this.arcMaterial.uniforms.angle.value = this.viewAngle;

      // vector uniforms in three.js use arrays
      var midpointUnitArray = [ this.midpointUnit.x, this.midpointUnit.y, this.midpointUnit.z ];
      var planarUnitArray = [ this.planarUnit.x, this.planarUnit.y, this.planarUnit.z ];

      this.sectorMaterial.uniforms.midpointUnit.value = midpointUnitArray;
      this.arcMaterial.uniforms.midpointUnit.value = midpointUnitArray;

      this.sectorMaterial.uniforms.planarUnit.value = planarUnitArray;
      this.arcMaterial.uniforms.planarUnit.value = planarUnitArray;
    }
  }, {
    // @private {LocalPool}
    pool: new LocalPool( 'BondAngleWebGLView', function( renderer ) {
      return new BondAngleWebGLView( renderer );
    } )
  } );
} );
