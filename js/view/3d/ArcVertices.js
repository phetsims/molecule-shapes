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
  var Vector3 = require( 'DOT/Vector3' );
  var Util = require( 'DOT/Util' );
  var Quaternion = require( 'DOT/Quaternion' );

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
    setPositions: function( startDir, endDir, lastMidpointDir ) {
      var i, ratio, position, vertex;
      var isApproximateSemicircle = ArcVertices.isApproximateSemicircle( startDir, endDir );

      if ( isApproximateSemicircle ) {
        // basically construct a an approximate semicircle based on the semicircleDir, so that our semicircle doesn't vary dramatically

        if ( !lastMidpointDir ) {
          lastMidpointDir = Vector3.Y_UNIT;
        }

        // find a vector that is as orthogonal to both directions as possible
        var badCross = startDir.cross( lastMidpointDir ).plus( lastMidpointDir.cross( endDir ) );
        var averageCross = badCross.magnitude() > 0 ? badCross.normalized() : new Vector3( 0, 0, 1 );

        // find a vector that gives us a balance between startDir and endDir (so our semicircle will balance out at the endpoints)
        var averagePointDir = startDir.minus( endDir ).normalized();

        // (basis vector 1) make that average point planar to our arc surface
        var planarPointDir = averagePointDir.minus( averagePointDir.times( averageCross.dot( averagePointDir ) ) ).normalized();

        // (basis vector 2) find a new midpoint direction that is planar to our arc surface
        var planarMidpointDir = averageCross.cross( planarPointDir ).normalized();

        // now make our semicircle around with our two orthonormal basis vectors
        for ( i = 0; i < this.numVertices; i++ ) {
          ratio = i / ( this.numVertices - 1 ); // zero to 1

          // 0 should be near startDir, 0.5 (pi/2) should be near semicircleDir, 1 (pi) should be near endDir
          var angle = ratio * Math.PI;

          position = planarPointDir.times( Math.cos( angle ) )
                                       .plus( planarMidpointDir.times( Math.sin( angle ) ) )
                                       .times( this.radius );

          // TODO: reduce allocations
          vertex = this.vertices[i];
          vertex.x = position.x;
          vertex.y = position.y;
          vertex.z = position.z;
        }

        this.midpoint = planarMidpointDir.times( this.radius );
      } else {
        // figure out the quaternion rotation from start to end
        var startToEnd = Quaternion.getRotationQuaternion( startDir, endDir );

        for ( i = 0; i < this.numVertices; i++ ) {
          ratio = i / ( this.numVertices - 1 ); // zero to 1

          // spherical linear interpolation (slerp) from start to end
          position = Quaternion.slerp( new Quaternion(), startToEnd, ratio ).timesVector3( startDir ).times( this.radius );

          // TODO: reduce allocations
          vertex = this.vertices[i];
          vertex.x = position.x;
          vertex.y = position.y;
          vertex.z = position.z;
        }

        this.midpoint = Vector3.slerp( startDir, endDir, 0.5 ).times( this.radius );
      }
    }
  }, {
    isApproximateSemicircle: function( startDir, endDir ) {
      return Math.acos( Util.clamp( startDir.dot( endDir ), -1, 1 ) ) >= 3.12414;
    }
  } );
} );
