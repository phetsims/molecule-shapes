// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of the angle (sector and line) between two bonds
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

  var radialVertexCount = 24;
  var radius = 5;

  var sectorGeometry = new THREE.Geometry();

  // center vertex
  sectorGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
  // radial vertices
  for ( var i = 0; i < radialVertexCount; i++ ) {
    sectorGeometry.vertices.push( new THREE.Vector3( i / ( radialVertexCount - 1 ), radius, 0 ) );
  }

  // faces
  var zeroVector = new THREE.Vector3();
  for ( var j = 0; j < radialVertexCount - 1; j++ ) {
    sectorGeometry.faces.push( new THREE.Face3( 0, j + 1, j + 2 ) );
    sectorGeometry.faceVertexUvs[ 0 ].push( [ zeroVector, zeroVector, zeroVector ]);
  }
  var localSectorGeometry = new LocalGeometry( sectorGeometry );

  var arcGeometry = new THREE.Geometry();

  // radial vertices
  for ( var k = 0; k < radialVertexCount; k++ ) {
    arcGeometry.vertices.push( new THREE.Vector3( k / ( radialVertexCount - 1 ), radius, 0 ) );
  }

  var localArcGeometry = new LocalGeometry( arcGeometry );

  function BondAngleWebGLView( renderer, model, molecule, aGroup, bGroup ) {
    assert && assert( MoleculeShapesGlobals.useWebGL );

    var view = this;

    THREE.Object3D.call( this );

    this.model = model;
    this.molecule = molecule;

    // @public
    this.aGroup = aGroup;
    this.bGroup = bGroup;

    this.arcGeometry = localArcGeometry.get( renderer );
    this.sectorGeometry = localSectorGeometry.get( renderer );

    var vertexShader = [
      'uniform float angle;',
      'uniform vec3 midpointUnit;',
      'uniform vec3 planarUnit;',
      'void main() {',
      '  float theta = ( position.x - 0.5 ) * angle;',
      '  vec3 location = position.y * ( cos( theta ) * midpointUnit + sin( theta ) * planarUnit );',
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

    this.sectorMaterial = new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse( JSON.stringify( uniforms ) ) // cheap deep copy
    } );
    this.sweepColorListener = function( color ) {
      view.sectorMaterial.uniforms.color.value = [color.r / 255, color.g / 255, color.b / 255];
    };
    MoleculeShapesColors.bondAngleSweepProperty.link( this.sweepColorListener );

    this.arcMaterial = new THREE.ShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      uniforms: JSON.parse( JSON.stringify( uniforms ) ) // cheap deep copy
    } );
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

    this.midpoint = null;
  }

  return inherit( THREE.Object3D, BondAngleWebGLView, {
    dispose: function() {
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
