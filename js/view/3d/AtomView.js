// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an atom {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

  /*
   * @param {string | Color | Property.<Color>} color
   */
  function AtomView( color ) {
    var atomView = this;

    // for now, cast it into place
    var colorProperty;
    if ( typeof color === 'string' ) {
      color = new Color( color );
    }
    if ( color instanceof Color ) {
      colorProperty = new Property( color );
    } else if ( color instanceof Property ) {
      colorProperty = color;
    } else {
      throw new Error( 'bad color passed to AtomView' );
    }

    var geometry = new THREE.SphereGeometry( 2, 64, 64 ); // may set to 32,32 for performance?

    THREE.Mesh.call( this, geometry, null );

    // TODO: clean up unused AtomViews!!! This leaks references
    colorProperty.link( function( color ) {
      atomView.material = new THREE.MeshLambertMaterial( {
        color: colorProperty.value.toNumber(),
        ambient: colorProperty.value.toNumber()
      } );
    } );
  }

  return inherit( THREE.Mesh, AtomView, {

  } );
} );
