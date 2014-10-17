// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an individual electron in a cloud {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );

  var numSamples = MoleculeShapesGlobals.useWebGL ? 10 : 5;

  // renderer-local access
  var localElectronGeometry = new LocalGeometry( new THREE.SphereGeometry( 0.1, numSamples, numSamples ) );
  var localElectronMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
    overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5
  } ), {
    color: MoleculeShapesColors.lonePairElectronProperty
  } );

  function ElectronView( renderer ) {
    THREE.Mesh.call( this, localElectronGeometry.get( renderer ), localElectronMaterial.get( renderer ) );
  }

  return inherit( THREE.Mesh, ElectronView, {
    dispose: function() {

    }
  } );
} );
