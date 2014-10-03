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
    var electronView = this;

    var numSamples = MoleculeShapesGlobals.useWebGL ? 10 : 5;
    var geometry = new THREE.SphereGeometry( 0.1, numSamples, numSamples );

    THREE.Mesh.call( this, geometry, null );

    // TODO: clean up unused ElectronViews!!! This leaks references
    MoleculeShapesColors.link( 'lonePairElectron', function( color ) {
      electronView.material = new THREE.MeshLambertMaterial( {
        color: color.toNumber(),
        ambient: color.toNumber(),
        overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5
      } );
    } );
  }

  return inherit( THREE.Mesh, ElectronView, {

  } );
} );
