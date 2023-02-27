// Copyright 2014-2023, University of Colorado Boulder

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
import { Node, Rectangle, Sizable, WidthSizable } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Multilink from '../../../../axon/js/Multilink.js';
import moleculeShapes from '../../moleculeShapes.js';

// TODO: Best sometime to actually have us extend panel sometime perhaps? Or have panelOptions?
class TitledPanel extends Sizable( Node ) {
  constructor( titleNode, contentNode, options ) {
    super( {
      excludeInvisibleChildrenFromBounds: true
    } );

    // We'll create a resizable content node for the Panel, since we want to include the titleNode's size within
    // our minimum width.
    // TODO: Before moving to common code, get this to support Sizable.
    const contentContainer = new ( WidthSizable( Node ) )( {
      children: [ contentNode ],

      // If our content is invisible, the actual Panel's content will be invisible, so it can collapse normally.
      visibleProperty: contentNode.visibleProperty
    } );

    // Forward preferred sizes from the container to the actual content node
    contentContainer.localPreferredWidthProperty.link( width => {
      if ( contentNode.widthSizable ) {
        contentNode.preferredWidth = width;
      }
    } );

    // Forward minimum sizes from the content (and title) to the container
    Multilink.multilink( [
      // TODO: Support non-sizable content nodes if moving to common code.
      contentNode.minimumWidthProperty,
      titleNode.boundsProperty
    ], ( contentWidth, titleBounds ) => {
      contentContainer.localMinimumWidth = Math.max( contentWidth, titleBounds.width + ( 2 * options.yMargin ) );
    } );

    options = merge( {}, Panel.DEFAULT_PANEL_OPTIONS, options );

    this.titleNode = titleNode; // @private {Node}
    this.titleBackgroundNode = new Rectangle( 0, 0, 5, 5, 0, 0, {
      fill: options.fill,
      visibleProperty: titleNode.visibleProperty,
      pickable: false
    } ); // @private {Rectangle}

    // @private {Node}
    this.panel = new Panel( contentContainer, {
      lineWidth: options.lineWidth,
      xMargin: options.xMargin,
      yMargin: options.yMargin,
      cornerRadius: options.cornerRadius,
      resize: options.resize,
      backgroundPickable: options.backgroundPickable,
      align: options.align
    } );
    this.setStroke( options.stroke );
    this.setFill( options.fill );

    // @private {Node}
    this.titleContainer = new Node();
    Multilink.multilink( [
      this.panel.boundsProperty,
      contentNode.visibleProperty,
      contentNode.boundsProperty
    ], ( panelBounds, contentVisible, contentBounds ) => {
      const isValid = panelBounds.isFinite() && contentBounds.isFinite() && contentVisible;
      this.titleContainer.children = isValid ? [ this.titleBackgroundNode, this.titleNode ] : [];
    } );

    this.addChild( this.panel );
    this.addChild( this.titleContainer );

    contentContainer.boundsProperty.lazyLink( this.updateTitlePosition.bind( this ) );
    contentNode.boundsProperty.lazyLink( this.updateTitlePosition.bind( this ) );
    this.panel.boundsProperty.lazyLink( this.updateTitlePosition.bind( this ) );
    titleNode.localBoundsProperty.lazyLink( this.updateTitlePosition.bind( this ) );
    this.updateTitlePosition();

    // Forward the panel's minimums to ours
    this.panel.minimumWidthProperty.link( minimumWidth => { this.localMinimumWidth = minimumWidth; } );
    this.panel.minimumHeightProperty.link( minimumHeight => { this.localMinimumHeight = minimumHeight; } );

    // Forward our preferred size to the panel
    this.localPreferredWidthProperty.link( preferredWidth => { this.panel.preferredWidth = preferredWidth; } );
    this.localPreferredHeightProperty.link( preferredHeight => { this.panel.preferredHeight = preferredHeight; } );

    this.mutate( options );
  }

  /**
   * @private
   */
  updateTitlePosition() {
    const hasContents = this.panel.bounds.isFinite();
    if ( hasContents ) {
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
