// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an individual electron in a cloud {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );

  // controls resolution for the sphere (number of samples in both directions)
  var NUM_SAMPLES = MoleculeShapesGlobals.useWebGL ? 10 : 3;

  // renderer-local access
  var localElectronGeometry = new LocalGeometry( new THREE.SphereGeometry( 0.1, NUM_SAMPLES, NUM_SAMPLES ) );
  var localElectronMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
    overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5 // amount to extend polygons when using Canvas to avoid cracks
  } ), {
    color: MoleculeShapesColors.lonePairElectronProperty
  } );

  /*
   * @constructor
   * @param {THREE.Renderer} renderer
   */
  function ElectronView( renderer ) {
    THREE.Mesh.call( this, localElectronGeometry.get( renderer ), localElectronMaterial.get( renderer ) );
  }

  return inherit( THREE.Mesh, ElectronView );
} );
