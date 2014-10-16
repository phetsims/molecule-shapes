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
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var ArcVertices = require( 'MOLECULE_SHAPES/common/view/3d/ArcVertices' );
  var ArcGeometry = require( 'MOLECULE_SHAPES/common/view/3d/ArcGeometry' );
  var SectorGeometry = require( 'MOLECULE_SHAPES/common/view/3d/SectorGeometry' );
  var BondAngleView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleView' );

  function BondAngleWebGLView( renderer, model, molecule, aGroup, bGroup ) {
    assert && assert( MoleculeShapesGlobals.useWebGL );

    var view = this;

    THREE.Object3D.call( this );

    this.model = model;
    this.molecule = molecule;

    // @public
    this.aGroup = aGroup;
    this.bGroup = bGroup;

    this.arcVertices = new ArcVertices( aGroup.orientation, bGroup.orientation, 5, 24, null ); // radius of 5, 24 segments
    this.arcGeometry = new ArcGeometry( this.arcVertices );
    this.sectorGeometry = new SectorGeometry( this.arcVertices );

    var vertexShader = [
      'void main() {',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
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
      this.arcGeometry.dispose();
      this.sectorGeometry.dispose();
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

      this.arcVertices.setPositions( aDir, bDir, lastMidpoint );
      this.arcGeometry.updateView();
      this.sectorGeometry.updateView();

      this.midpoint = this.arcVertices.midpoint;
    }
  } );
} );
