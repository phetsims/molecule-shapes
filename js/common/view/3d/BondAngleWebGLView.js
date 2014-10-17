// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of the angle (sector and arc) between two bonds. The sector is the filled-in area between two bonds, and the
 * arc is the line along the edge of the sector.
 *
 * NOTE: This does NOT include the text readout for the label
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Util = require( 'DOT/Util' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var ArcVertices = require( 'MOLECULE_SHAPES/common/view/3d/ArcVertices' );
  var BondAngleView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleView' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );

  var radialVertexCount = 24; // how many vertices to use along the view
  var radius = 5; // in view units

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

    // the rest of the vertices (1 to radialVertexCount) are radial
    for ( var i = 0; i < radialVertexCount; i++ ) {
      var ratio = i / ( radialVertexCount - 1 ); // from 0 to 1
      geometry.vertices.push( new THREE.Vector3( ratio, radius, 0 ) );
    }

    // faces (1 less than the number of radial vertices)
    for ( var j = 0; j < radialVertexCount - 1; j++ ) {
      // we use a fan approach, first vertex is always the first (center) vertex, the other two are radial
      geometry.faces.push( new THREE.Face3( 0, j + 1, j + 2 ) );
    }

    return geometry;
  }

  function createArcGeometry() {
    var geometry = new THREE.Geometry();

    // radial vertices only
    for ( var i = 0; i < radialVertexCount; i++ ) {
      var ratio = i / ( radialVertexCount - 1 ); // from 0 to 1
      geometry.vertices.push( new THREE.Vector3( ratio, radius, 0 ) );
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

  // "prototype" uniforms object. Deep copies will be made for each view since they need to change independently
  var uniforms = {
    opacity: {
      type: 'f',
      value: 0.5
    },
    color: {
      type: '3f',
      value: [1,1,1]
    },
    angle: {
      type: 'f',
      value: Math.PI / 2
    },
    midpointUnit: {
      type: '3f',
      value: [0,1,0]
    },
    planarUnit: {
      type: '3f',
      value: [1,0,0]
    }
  };

  function BondAngleWebGLView( renderer, model, molecule, aGroup, bGroup ) {
    assert && assert( MoleculeShapesGlobals.useWebGL );

    var view = this;

    THREE.Object3D.call( this );

    // @public
    this.aGroup = aGroup;
    this.bGroup = bGroup;
    this.midpoint = null; // updated in updateView(), provided for positioning the bond labels

    // @private
    this.model = model;
    this.molecule = molecule;
    this.arcGeometry = localArcGeometry.get( renderer );
    this.sectorGeometry = localSectorGeometry.get( renderer );

    // we require one material per view so we can change the uniforms independently
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
      view.sectorMaterial.uniforms.color.value = [color.r / 255, color.g / 255, color.b / 255];
    };
    MoleculeShapesColors.bondAngleSweepProperty.link( this.sweepColorListener );

    // we require one material per view so we can change the uniforms independently
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
      view.arcMaterial.uniforms.color.value = [color.r / 255, color.g / 255, color.b / 255];
    };
    MoleculeShapesColors.bondAngleArcProperty.link( this.arcColorListener );

    this.sectorView = new THREE.Mesh( this.sectorGeometry, this.sectorMaterial );
    this.arcView = new THREE.Line( this.arcGeometry, this.arcMaterial );

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;

    this.add( this.sectorView );
    this.add( this.arcView );
  }

  return inherit( THREE.Object3D, BondAngleWebGLView, {
    dispose: function() {
      // since we need materials for each instance, we need to dispose properly
      this.sectorMaterial.dispose();
      this.arcMaterial.dispose();

      MoleculeShapesColors.bondAngleSweepProperty.unlink( this.sweepColorListener );
      MoleculeShapesColors.bondAngleArcProperty.unlink( this.arcColorListener );
    },

    updateView: function( lastMidpoint ) {
      // TODO: we're doing this too much, refactor into one place in MoleculeView!
      var cameraPosition = new THREE.Vector3().copy( MoleculeShapesScreenView.cameraPosition ); // this SETS cameraPosition
      this.parent.worldToLocal( cameraPosition ); // this mutates cameraPosition

      var localCameraPosition = new Vector3().set( cameraPosition ).normalized();

      var aDir = this.aGroup.orientation;
      var bDir = this.bGroup.orientation;

      var alpha = this.model.showBondAngles ? BondAngleView.calculateBrightness( aDir, bDir, localCameraPosition, this.molecule.radialAtoms.length ) : 0;

      this.sectorMaterial.uniforms.opacity.value = alpha * 0.5;
      this.arcMaterial.uniforms.opacity.value = alpha * 0.7;

      var angle = Math.acos( Util.clamp( aDir.dot( bDir ), -1, 1 ) );
      this.sectorMaterial.uniforms.angle.value = angle;
      this.arcMaterial.uniforms.angle.value = angle;

      var isApproximateSemicircle = ArcVertices.isApproximateSemicircle( aDir, bDir );
      var midpointUnit, planarUnit;
      if ( isApproximateSemicircle ) {
        if ( !lastMidpoint ) {
          lastMidpoint = Vector3.Y_UNIT.times( radius );
        }
        var lastMidpointDir = lastMidpoint.normalized();

        // find a vector that is as orthogonal to both directions as possible
        var badCross = aDir.cross( lastMidpointDir ).plus( lastMidpointDir.cross( bDir ) );
        var averageCross = badCross.magnitude() > 0 ? badCross.normalized() : new Vector3( 0, 0, 1 );

        // find a vector that gives us a balance between aDir and bDir (so our semicircle will balance out at the endpoints)
        var averagePointDir = aDir.minus( bDir ).normalized();

        // (basis vector 1) make that average point planar to our arc surface
        planarUnit = averagePointDir.minus( averageCross.times( averageCross.dot( averagePointDir ) ) ).normalized();

        // (basis vector 2) find a new midpoint direction that is planar to our arc surface
        midpointUnit = averageCross.cross( planarUnit ).normalized();
      } else {
        midpointUnit = aDir.plus( bDir ).normalized();
        planarUnit = aDir.minus( midpointUnit.times( aDir.dot( midpointUnit ) ) ).normalized();
      }

      var midpointUnitArray = [midpointUnit.x, midpointUnit.y, midpointUnit.z];
      var planarUnitArray = [planarUnit.x, planarUnit.y, planarUnit.z];

      this.sectorMaterial.uniforms.midpointUnit.value = midpointUnitArray;
      this.arcMaterial.uniforms.midpointUnit.value = midpointUnitArray;

      this.sectorMaterial.uniforms.planarUnit.value = planarUnitArray;
      this.arcMaterial.uniforms.planarUnit.value = planarUnitArray;

      this.midpoint = midpointUnit.times( radius );
    }
  } );
} );
