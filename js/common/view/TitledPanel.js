// Copyright 2014-2016, University of Colorado Boulder

/**
 * A Panel, but with an added {Node} title centered along the location of the top border. Additionally, the border
 * behind the title is hidden.
 *
 * NOTE: TitledPanel requires that its background color is the same as the background color BEHIND the panel, since it
 * is intended that there is no line in-between the two near where the title is. We use a rectangle with this background
 * color to hide the border, so that it blends well into the content around it.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Panel = require( 'SUN/Panel' );

  function TitledPanel( titleNode, contentNode, options ) {
    Node.call( this );

    options = _.extend( {}, Panel.DEFAULT_OPTIONS, options );

    this.titleNode = titleNode; // @private {Node}
    this.titleBackgroundNode = new Rectangle( 0, 0, 5, 5, 0, 0, { fill: options.fill } ); // @private {Rectangle}

    // @private {Node}
    this.panel = new Panel( contentNode, {
      lineWidth: options.lineWidth,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      cornerRadius: options.cornerRadius,
      resize: options.resize,
      backgroundPickable: options.backgroundPickable,
      minWidth: Math.max( options.minWidth || 0, titleNode.width + ( 2 * options.yMargin ) )
    } );
    this.setStroke( options.stroke );
    this.setFill( options.fill );

    this.addChild( this.panel );
    this.addChild( this.titleBackgroundNode );
    this.addChild( this.titleNode );

    contentNode.addEventListener( 'bounds', this.updateTitleLocation.bind( this ) );
    this.updateTitleLocation();

    this.mutate( options );
  }

  moleculeShapes.register( 'TitledPanel', TitledPanel );

  return inherit( Node, TitledPanel, {
    /**
     * @private
     */
    updateTitleLocation: function() {
      this.titleNode.centerX = this.panel.centerX;
      this.titleNode.centerY = this.panel.top;
      this.titleBackgroundNode.setRectBounds( this.titleNode.bounds.dilatedX( 10 ) );
    },

    getStroke: function() {
      return this.panel.stroke;
    },
    get stroke() { return this.getStroke(); },
    setStroke: function( stroke ) {
      this.panel.stroke = stroke;
    },
    set stroke( value ) { this.setStroke( value ); },

    getFill: function() {
      return this.panel.fill;
    },
    get fill() { return this.getFill(); },
    setFill: function( fill ) {
      this.panel.fill = fill;

      this.titleBackgroundNode.fill = fill;
    },
    set fill( value ) { this.setFill( value ); }
  } );
} );

