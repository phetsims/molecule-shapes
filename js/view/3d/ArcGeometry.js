// Copyright 2002-2014, University of Colorado Boulder

/**
 * Just a path of vertices along an arc
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );

  function ArcGeometry( arcVertices ) {
    THREE.Geometry.call( this );

    this.arcVertices = arcVertices;

    for ( var i = 0; i < this.arcVertices.vertices.length; i++ ) {
      // unclear whether concat would be supported
      this.vertices.push( this.arcVertices.vertices[i] );
    }

    this.dynamic = true; // so we can be updated
  }

  return inherit( THREE.Geometry, ArcGeometry, {
    updateView: function() {
      this.verticesNeedUpdate = true;
    }
  } );
} );
