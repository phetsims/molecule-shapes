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
    this.atomGeometry = new THREE.SphereGeometry( 2, numSamples, numSamples );

    this.atomMaterial = new THREE.MeshLambertMaterial( {
      overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.5
    } );
    this.unlinkColor = MoleculeShapesGlobals.linkColorAndAmbient( this.atomMaterial, colorProperty );

    THREE.Mesh.call( this, this.atomGeometry, this.atomMaterial );
  }

  return inherit( THREE.Mesh, AtomView, {
    dispose: function() {
      this.atomMaterial.dispose();
      this.atomGeometry.dispose();

      this.unlinkColor();
    }
  } );
} );
