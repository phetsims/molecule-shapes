// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an atom {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );

  function AtomView( color ) {
    var baseColor = new Color( color ).toNumber();
    var material = new THREE.MeshLambertMaterial( {
      color: baseColor,
      ambient: baseColor
    } );
    var geometry = new THREE.SphereGeometry( 2, 64, 64 ); // may set to 32,32 for performance?

    THREE.Mesh.call( this, geometry, material );
  }

  return inherit( THREE.Mesh, AtomView, {

  } );
} );
