// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an atom {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/view/MoleculeShapesGlobals' );

  /*
   * @param {string | Color | Property.<Color>} color
   */
  function AtomView( color ) {
    var atomView = this;

    // for now, cast it into place
    var colorProperty = MoleculeShapesGlobals.toColorProperty( color );

    var numSamples = MoleculeShapesGlobals.useWebGL ? 64 : 12;
    var geometry = new THREE.SphereGeometry( 2, numSamples, numSamples );

    THREE.Mesh.call( this, geometry, null );

    // TODO: clean up unused AtomViews!!! This leaks references
    colorProperty.link( function( color ) {
      atomView.material = new THREE.MeshLambertMaterial( {
        color: color.toNumber(),
        ambient: color.toNumber(),
        overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5
      } );
    } );
  }

  return inherit( THREE.Mesh, AtomView, {

  } );
} );
