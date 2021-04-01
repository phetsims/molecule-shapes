// Copyright 2014-2020, University of Colorado Boulder

/**
 * A Panel, but with an added {Node} title centered along the position of the top border. Additionally, the border
 * behind the title is hidden.
 *
 * NOTE: TitledPanel requires that its background color is the same as the background color BEHIND the panel, since it
 * is intended that there is no line in-between the two near where the title is. We use a rectangle with this background
 * color to hide the border, so that it blends well into the content around it.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Panel from '../../../../sun/js/Panel.js';
import moleculeShapes from '../../moleculeShapes.js';

class TitledPanel extends Node {
  constructor( titleNode, contentNode, options ) {
    super();

    options = merge( {}, Panel.DEFAULT_OPTIONS, options );

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

    contentNode.boundsProperty.lazyLink( this.updateTitlePosition.bind( this ) );
    titleNode.localBoundsProperty.lazyLink( this.updateTitlePosition.bind( this ) );
    this.updateTitlePosition();

    this.mutate( options );
  }

  /**
   * @private
   */
  updateTitlePosition() {
    if ( this.panel.bounds.isFinite() ) {
      this.titleNode.centerX = this.panel.centerX;
      this.titleNode.centerY = this.panel.top;
      this.titleBackgroundNode.setRectBounds( this.titleNode.bounds.dilatedX( 10 ) );
    }
  }

  /**
   * @public
   *
   * @returns {PaintDef}
   */
  getStroke() {
    return this.panel.stroke;
  }

  get stroke() { return this.getStroke(); }

  /**
   * @public
   *
   * @param {PaintDef} stroke
   */
  setStroke( stroke ) {
    this.panel.stroke = stroke;
  }

  set stroke( value ) { this.setStroke( value ); }

  /**
   * @public
   *
   * @returns {PaintDef}
   */
  getFill() {
    return this.panel.fill;
  }

  get fill() { return this.getFill(); }

  /**
   * @public
   *
   * @param {PaintDef} stroke
   */
  setFill( fill ) {
    this.panel.fill = fill;

    this.titleBackgroundNode.fill = fill;
  }

  set fill( value ) { this.setFill( value ); }
}

moleculeShapes.register( 'TitledPanel', TitledPanel );

export default TitledPanel;
