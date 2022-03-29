// Copyright 2022, University of Colorado Boulder

/**
 * Warning displayed when we have to fall back to Canvas (not due to normal lack-of-WebGL reasons, but specifically for
 * IE11 that is too low of a version). See https://github.com/phetsims/molecule-shapes/issues/133 and
 * https://github.com/phetsims/molecule-shapes/issues/132.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import openPopup from '../../../../phet-core/js/openPopup.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import sceneryPhet from '../../../../scenery-phet/js/sceneryPhet.js';
import sceneryPhetStrings from '../../../../scenery-phet/js/sceneryPhetStrings.js';
import { HBox, Path, Text, VBox } from '../../../../scenery/js/imports.js';
import exclamationTriangleSolidShape from '../../../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';

const webglWarningIe11StencilBodyString = sceneryPhetStrings.webglWarning.ie11StencilBody;
const webglWarningTitleString = sceneryPhetStrings.webglWarning.title;

class IE11StencilWarningNode extends HBox {
  constructor() {
    super( {
      children: [
        new Path( exclamationTriangleSolidShape, {
          fill: '#E87600', // "safety orange", according to Wikipedia
          scale: 0.048
        } ),
        new VBox( {
          children: [
            new Text( webglWarningTitleString, {
              font: new PhetFont( 14 ),
              fill: '#ddd'
            } ),
            new Text( webglWarningIe11StencilBodyString, {
              font: new PhetFont( 10 ),
              fill: '#999'
            } )
          ],
          spacing: 3,
          align: 'left'
        } )
      ],
      spacing: 12,
      align: 'center',
      cursor: 'pointer'
    } );

    this.mouseArea = this.touchArea = this.localBounds;

    this.addInputListener( {
      up: function() {
        openPopup( 'http://windowsupdate.microsoft.com/' );
      }
    } );
  }
}

sceneryPhet.register( 'IE11StencilWarningNode', IE11StencilWarningNode );
export default IE11StencilWarningNode;