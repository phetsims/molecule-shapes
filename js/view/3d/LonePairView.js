// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of a lone pair {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/view/MoleculeShapesGlobals' );
  var ElectronView = require( 'MOLECULE_SHAPES/view/3d/ElectronView' );
  var LonePairGeometryData = require( 'MOLECULE_SHAPES/data/LonePairGeometryData' );

  var jsonLoader = new THREE.JSONLoader();

  function LonePairView() {
    THREE.Object3D.call( this );

    // TODO: don't require parse on loading, but handle separately for each three.js scene?
    var lonePairGeometry = jsonLoader.parse( LonePairGeometryData ).geometry;

    var shellMaterial = new THREE.MeshLambertMaterial( {
      transparent: true,
      opacity: 0.7,
      overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.1
    } );
    this.unlinkColor = MoleculeShapesGlobals.linkColorAndAmbient( shellMaterial, MoleculeShapesColors.lonePairShellProperty );

    var shell = new THREE.Mesh( lonePairGeometry, shellMaterial );

    shell.scale.x = shell.scale.y = shell.scale.z = 2.5;
    shell.position.y = 0.001; // slight offset so three.js will z-sort the shells correctly for the transparency pass
    this.add( shell );

    // refactor!
    var electronScale = 2.5;

    this.electronView1 = new ElectronView();
    this.electronView2 = new ElectronView();
    this.add( this.electronView1 );
    this.add( this.electronView2 );
    this.electronView1.scale.x = this.electronView1.scale.y = this.electronView1.scale.z = 2.5;
    this.electronView2.scale.x = this.electronView2.scale.y = this.electronView2.scale.z = 2.5;

    this.electronView1.position.x = 0.3 * electronScale;
    this.electronView2.position.x = -0.3 * electronScale;
    this.electronView1.position.y = this.electronView2.position.y = 2 * electronScale;
  }

  return inherit( THREE.Object3D, LonePairView, {
    dispose: function() {
      this.unlinkColor();

      this.electronView1.dispose();
      this.electronView2.dispose();
    }
  } );
} );
