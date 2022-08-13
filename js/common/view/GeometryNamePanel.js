// Copyright 2014-2022, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { GridBox, Node, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import MoleculeShapesCheckbox from './MoleculeShapesCheckbox.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';
import MoleculeShapesPanel from './MoleculeShapesPanel.js';

// string list needed to compute maximum label bounds
const geometryStringProperties = [
  moleculeShapesStrings.geometry.emptyProperty,
  moleculeShapesStrings.geometry.diatomicProperty,
  moleculeShapesStrings.geometry.linearProperty,
  moleculeShapesStrings.geometry.trigonalPlanarProperty,
  moleculeShapesStrings.geometry.tetrahedralProperty,
  moleculeShapesStrings.geometry.trigonalBipyramidalProperty,
  moleculeShapesStrings.geometry.octahedralProperty
];

// string list needed to compute maximum label bounds
const shapeStringProperties = [
  moleculeShapesStrings.shape.emptyProperty,
  moleculeShapesStrings.shape.diatomicProperty,
  moleculeShapesStrings.shape.linearProperty,
  moleculeShapesStrings.shape.bentProperty,
  moleculeShapesStrings.shape.trigonalPlanarProperty,
  moleculeShapesStrings.shape.trigonalPyramidalProperty,
  moleculeShapesStrings.shape.tShapedProperty,
  moleculeShapesStrings.shape.tetrahedralProperty,
  moleculeShapesStrings.shape.seesawProperty,
  moleculeShapesStrings.shape.squarePlanarProperty,
  moleculeShapesStrings.shape.trigonalBipyramidalProperty,
  moleculeShapesStrings.shape.squarePyramidalProperty,
  moleculeShapesStrings.shape.octahedralProperty
];

const geometryNameFont = new PhetFont( 16 );

function getMaximumTextWidth( stringProperties ) {
  return new DerivedProperty( stringProperties, ( ...strings ) => {
    return Math.max( ...strings.map( string => {
      return new Text( string, { font: geometryNameFont } ).width;
    } ) );
  } );
}

const maxGeometryWidthProperty = getMaximumTextWidth( geometryStringProperties );
const maxShapeWidthProperty = getMaximumTextWidth( shapeStringProperties );

class GeometryNamePanel extends MoleculeShapesPanel {
  /**
   * @param {MoleculeShapesModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    options = merge( {
      fill: MoleculeShapesColors.backgroundProperty,
      tandem: tandem
    }, options );

    const content = new GridBox( {
      xSpacing: 20,
      ySpacing: 10
    } );

    super( moleculeShapesStrings.control.geometryNameProperty, content, tandem );

    // @private {MoleculeShapesModel}
    this.model = model;

    // labels for the types of geometries
    const textLabelFont = new PhetFont( 14 );

    // @private {MoleculeShapesCheckbox}
    const moleculeGeometryCheckboxTandem = tandem.createTandem( 'moleculeGeometryCheckbox' );
    this.moleculeGeometryCheckbox = new MoleculeShapesCheckbox( model.showMoleculeGeometryProperty, new Text( moleculeShapesStrings.control.moleculeGeometry, {
      font: textLabelFont,
      fill: MoleculeShapesColors.moleculeGeometryNameProperty,
      tandem: moleculeGeometryCheckboxTandem.createTandem( 'labelText' ),
      textProperty: moleculeShapesStrings.control.moleculeGeometryProperty
    } ), {
      tandem: moleculeGeometryCheckboxTandem,
      layoutOptions: {
        column: 1,
        row: 0
      }
    } );
    const electronGeometryCheckboxTandem = model.isBasicsVersion ? Tandem.OPT_OUT : tandem.createTandem( 'electronGeometryCheckbox' );
    this.electronGeometryCheckbox = new MoleculeShapesCheckbox( model.showElectronGeometryProperty, new Text( moleculeShapesStrings.control.electronGeometry, {
      font: textLabelFont,
      fill: MoleculeShapesColors.electronGeometryNameProperty,
      tandem: electronGeometryCheckboxTandem.createTandem( 'labelText' ),
      textProperty: moleculeShapesStrings.control.electronGeometryProperty
    } ), {
      tandem: electronGeometryCheckboxTandem,
      layoutOptions: {
        column: 0,
        row: 0
      }
    } );

    // @private {Text} - text fields that will show the name of the geometry (uses string placeholders for height)
    this.moleculeText = new Text( 'X', {
      visibleProperty: model.showMoleculeGeometryProperty,
      font: geometryNameFont,
      pickable: false,
      fill: MoleculeShapesColors.moleculeGeometryNameProperty
    } );
    // @private {Text}
    this.electronText = new Text( 'Y', {
      visibleProperty: model.showElectronGeometryProperty,
      font: geometryNameFont,
      pickable: false,
      fill: MoleculeShapesColors.electronGeometryNameProperty
    } );

    const moleculeTextContainer = new Node( {
      // Hide this container only when the checkbox is hidden
      visibleProperty: this.moleculeGeometryCheckbox.visibleProperty,
      children: [ this.moleculeText ],
      layoutOptions: {
        column: 1,
        row: 1
      }
    } );
    maxGeometryWidthProperty.link( maxGeometryWidth => {
      moleculeTextContainer.mutateLayoutOptions( {
        minContentWidth: maxGeometryWidth
      } );
    } );


    // TODO: pointer area listeners

    content.addChild( this.moleculeGeometryCheckbox );
    content.addChild( moleculeTextContainer );

    Multilink.multilink( [ this.moleculeGeometryCheckbox.boundsProperty, moleculeTextContainer.boundsProperty, content.boundsProperty ], () => {
      const bounds = this.moleculeGeometryCheckbox.localBounds.union( this.moleculeGeometryCheckbox.boundsOf( moleculeTextContainer ) ).dilated( 10 );
      this.moleculeGeometryCheckbox.touchArea = this.moleculeGeometryCheckbox.mouseArea = bounds;
    } );

    if ( !model.isBasicsVersion ) {
      const electronTextContainer = new Node( {
        // Hide this container only when the checkbox is hidden
        visibleProperty: this.electronGeometryCheckbox.visibleProperty,
        children: [ this.electronText ],
        layoutOptions: {
          column: 0,
          row: 1
        }
      } );
      maxShapeWidthProperty.link( maxShapeWidth => {
        electronTextContainer.mutateLayoutOptions( {
          minContentWidth: maxShapeWidth
        } );
      } );

      // basics version excludes lone-pair (electron) geometries
      content.addChild( this.electronGeometryCheckbox );
      content.addChild( electronTextContainer );

      Multilink.multilink( [ this.electronGeometryCheckbox.boundsProperty, electronTextContainer.boundsProperty, content.boundsProperty ], () => {
        const bounds = this.electronGeometryCheckbox.localBounds.union( this.electronGeometryCheckbox.boundsOf( electronTextContainer ) ).dilated( 10 );
        this.electronGeometryCheckbox.touchArea = this.electronGeometryCheckbox.mouseArea = bounds;
      } );
    }

    const updateNames = this.updateNames.bind( this );
    model.moleculeProperty.link( ( newMolecule, oldMolecule ) => {
      if ( oldMolecule ) {
        oldMolecule.bondChangedEmitter.removeListener( updateNames );
      }
      if ( newMolecule ) {
        newMolecule.bondChangedEmitter.addListener( updateNames );
      }
      updateNames();
    } );

    this.mutate( options );

    this.maxWidth = 900; // See https://github.com/phetsims/molecule-shapes/issues/137
  }

  /**
   * @private
   */
  updateNames() {
    this.moleculeText.textProperty = this.getMoleculeGeometryName();
    this.electronText.textProperty = this.getElectronGeometryName();

    // layout
    this.moleculeText.centerX = this.moleculeGeometryCheckbox.centerX;
    this.electronText.centerX = this.electronGeometryCheckbox.centerX;
  }

  /**
   * @private
   */
  getMoleculeGeometryName() {
    const nameProperty = this.model.moleculeProperty.value.getCentralVSEPRConfiguration().moleculeGeometry.stringProperty;
    if ( nameProperty === null ) {
      return moleculeShapesStrings.shape.emptyProperty;
    }
    else {
      return nameProperty;
    }
  }

  /**
   * @private
   */
  getElectronGeometryName() {
    const nameProperty = this.model.moleculeProperty.value.getCentralVSEPRConfiguration().electronGeometry.stringProperty;
    if ( nameProperty === null ) {
      return moleculeShapesStrings.geometry.emptyProperty;
    }
    else {
      return nameProperty;
    }
  }
}

moleculeShapes.register( 'GeometryNamePanel', GeometryNamePanel );

export default GeometryNamePanel;