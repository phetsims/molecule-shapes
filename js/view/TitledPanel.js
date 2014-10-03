//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A panel with a title on the top, that relies on a consistent background color.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Panel = require( 'SUN/Panel' );

  function TitledPanel( titleNode, contentNode, options ) {
    Node.call( this );

    options = _.extend( {
      // TODO: remove duplication with panel, but we want these set before-hand! Extract defaults from Panel?
      fill: 'white',
      stroke: 'black',
      lineWidth: 1, // width of the background border
      xMargin: 5,
      yMargin: 5,
      cornerRadius: 10, // radius of the rounded corners on the background
      resize: true, // dynamically resize when content bounds change
      backgroundPickable: false
    }, options );

    this.titleNode = titleNode;
    this.titleBackgroundNode = new Rectangle( 0, 0, 5, 5, 0, 0, { fill: options.fill } );
    this.panel = new Panel( contentNode, {
      // TODO: better way of not forwarding things like 'scale' that would be double-applied
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      cornerRadius: options.cornerRadius,
      resize: options.resize,
      backgroundPickable: options.backgroundPickable
    } );

    this.addChild( this.panel );
    this.addChild( this.titleBackgroundNode );
    this.addChild( this.titleNode );

    contentNode.addEventListener( 'bounds', this.updateTitleLocation.bind( this ) );
    this.updateTitleLocation();

    this.mutate( options );
  }

  return inherit( Node, TitledPanel, {
    updateTitleLocation: function() {
      this.titleNode.centerX = this.panel.centerX;
      this.titleNode.centerY = this.panel.top;
      this.titleBackgroundNode.setRectBounds( this.titleNode.bounds.dilatedX( 10 ) );
    },

    setStroke: function( stroke ) {
      this.panel.stroke = stroke;
    },

    setFill: function( fill ) {
      this.panel.fill = fill;

      this.titleBackgroundNode.fill = fill;
    }
  } );
} );

