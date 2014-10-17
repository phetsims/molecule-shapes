// Copyright 2002-2014, University of Colorado Boulder

/**
 * Vertex computations for our bond angle nodes (arc/sector handling). Needs customized logic for stabilizing
 * 180-degree (or approximate) arcs, using a previous midpoint.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );

  function ArcVertices( startDir, endDir, radius, numSegments, lastMidpointDir ) {
    this.radius = radius;
    this.numSegments = numSegments;
    this.numVertices = numSegments + 1;

    this.midpoint = null;

    this.vertices = [];

    for ( var i = 0; i < this.numVertices; i++ ) {
      this.vertices.push( new THREE.Vector3() );
    }

    this.setPositions( startDir, endDir, lastMidpointDir );
  }

  return inherit( Object, ArcVertices, {
    setPositions: function( midpointUnit, planarUnit, angle ) {
      for ( var i = 0; i < this.numVertices; i++ ) {
        var ratio = i / ( this.numVertices - 1 ); // zero to 1

        var theta = ( ratio - 0.5 ) * angle;
        var position = midpointUnit.times( Math.cos( theta ) ).plus( planarUnit.times( Math.sin( theta ) ) ).times( this.radius );

        var vertex = this.vertices[i];
        vertex.x = position.x;
        vertex.y = position.y;
        vertex.z = position.z;
      }
    }
  } );
} );
