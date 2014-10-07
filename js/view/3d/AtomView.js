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
    // for now, cast it into place
    var colorProperty = MoleculeShapesGlobals.toColorProperty( color );

    var numSamples = MoleculeShapesGlobals.useWebGL ? 64 : 12;
    var geometry = new THREE.SphereGeometry( 2, numSamples, numSamples );

    var material = new THREE.MeshLambertMaterial( {
      overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5
    } );
    // TODO: clean up unused AtomViews!!! This leaks references
    var colorListener = function( color ) {
      material.color.setHex( color.toNumber() );
      material.ambient.setHex( color.toNumber() );
    };
    colorProperty.link( colorListener );
    this.dispose = function() {
      colorProperty.unlink( colorListener );
    };

    THREE.Mesh.call( this, geometry, material );
  }

  return inherit( THREE.Mesh, AtomView, {

  } );
} );
