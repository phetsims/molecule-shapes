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
    var geometry = new THREE.SphereGeometry( 0.1, numSamples, numSamples );
    var material = new THREE.MeshLambertMaterial( {
      overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5
    } );
    this.unlinkColor = MoleculeShapesGlobals.linkColor( material, MoleculeShapesColors.lonePairElectronProperty );

    THREE.Mesh.call( this, geometry, material );
  }

  return inherit( THREE.Mesh, ElectronView, {
    dispose: function() {
      this.unlinkColor();
    }
  } );
} );
