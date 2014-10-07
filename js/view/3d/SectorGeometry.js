// Copyright 2002-2014, University of Colorado Boulder

/**
 * Includes a full sector
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );

  function SectorGeometry( arcVertices ) {
    THREE.Geometry.call( this );

    this.arcVertices = arcVertices;

    // center
    this.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    for ( var i = 0; i < this.arcVertices.vertices.length; i++ ) {
      // unclear whether concat would be supported
      this.vertices.push( this.arcVertices.vertices[i] );
    }

    var zeroVector = new THREE.Vector3();

    for ( var j = 0; j < this.arcVertices.vertices.length - 1; j++ ) {
      this.faces.push( new THREE.Face3( 0, j + 1, j + 2 ) );
      this.faceVertexUvs[ 0 ].push( [ zeroVector, zeroVector, zeroVector ]);
    }

    this.dynamic = true; // so we can be updated
  }

  return inherit( THREE.Geometry, SectorGeometry, {
    updateView: function() {
      this.verticesNeedUpdate = true;

      // this.computeFaceNormals(); // can we omit this?
    }
  } );
} );
