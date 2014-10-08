// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an individual electron in a cloud {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/view/MoleculeShapesGlobals' );

  function ElectronView() {
    var numSamples = MoleculeShapesGlobals.useWebGL ? 10 : 5;
    this.electronGeometry = new THREE.SphereGeometry( 0.1, numSamples, numSamples );
    this.electronMaterial = new THREE.MeshLambertMaterial( {
      overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5
    } );
    this.unlinkColor = MoleculeShapesGlobals.linkColor( this.electronMaterial, MoleculeShapesColors.lonePairElectronProperty );

    THREE.Mesh.call( this, this.electronGeometry, this.electronMaterial );
  }

  return inherit( THREE.Mesh, ElectronView, {
    dispose: function() {
      this.electronGeometry.dispose();
      this.electronMaterial.dispose();

      this.unlinkColor();
    }
  } );
} );
