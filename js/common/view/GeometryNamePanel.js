// Copyright 2014-2021, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { GridBox } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import MoleculeShapesCheckbox from './MoleculeShapesCheckbox.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';
import MoleculeShapesPanel from './MoleculeShapesPanel.js';

const controlElectronGeometryString = moleculeShapesStrings.control.electronGeometry;
const controlGeometryNameString = moleculeShapesStrings.control.geometryName;
const controlMoleculeGeometryString = moleculeShapesStrings.control.moleculeGeometry;

const geometryDiatomicString = moleculeShapesStrings.geometry.diatomic;
const geometryEmptyString = moleculeShapesStrings.geometry.empty;
const geometryLinearString = moleculeShapesStrings.geometry.linear;
const geometryOctahedralString = moleculeShapesStrings.geometry.octahedral;
const geometryTetrahedralString = moleculeShapesStrings.geometry.tetrahedral;
const geometryTrigonalBipyramidalString = moleculeShapesStrings.geometry.trigonalBipyramidal;
const geometryTrigonalPlanarString = moleculeShapesStrings.geometry.trigonalPlanar;

const shapeBentString = moleculeShapesStrings.shape.bent;
const shapeDiatomicString = moleculeShapesStrings.shape.diatomic;
const shapeEmptyString = moleculeShapesStrings.shape.empty;
const shapeLinearString = moleculeShapesStrings.shape.linear;
const shapeOctahedralString = moleculeShapesStrings.shape.octahedral;
const shapeSeesawString = moleculeShapesStrings.shape.seesaw;
const shapeSquarePlanarString = moleculeShapesStrings.shape.squarePlanar;
const shapeSquarePyramidalString = moleculeShapesStrings.shape.squarePyramidal;
const shapeTetrahedralString = moleculeShapesStrings.shape.tetrahedral;
const shapeTrigonalBipyramidalString = moleculeShapesStrings.shape.trigonalBipyramidal;
const shapeTrigonalPlanarString = moleculeShapesStrings.shape.trigonalPlanar;
const shapeTrigonalPyramidalString = moleculeShapesStrings.shape.trigonalPyramidal;
const shapeTShapedString = moleculeShapesStrings.shape.tShaped;

// string list needed to compute maximum label bounds
const geometryStrings = [
  geometryEmptyString,
  geometryDiatomicString,
  geometryLinearString,
  geometryTrigonalPlanarString,
  geometryTetrahedralString,
  geometryTrigonalBipyramidalString,
  geometryOctahedralString
];

// string list needed to compute maximum label bounds
const shapeStrings = [
  shapeEmptyString,
  shapeDiatomicString,
  shapeLinearString,
  shapeBentString,
  shapeTrigonalPlanarString,
  shapeTrigonalPyramidalString,
  shapeTShapedString,
  shapeTetrahedralString,
  shapeSeesawString,
  shapeSquarePlanarString,
  shapeTrigonalBipyramidalString,
  shapeSquarePyramidalString,
  shapeOctahedralString
];

const geometryNameFont = new PhetFont( 16 );

function getMaximumTextWidth( strings ) {
  let maxWidth = 0;
  _.each( strings, string => {
    maxWidth = Math.max( maxWidth, new Text( string, { font: geometryNameFont } ).width );
  } );
  return maxWidth;
}

const maxGeometryWidth = getMaximumTextWidth( geometryStrings );
const maxShapeWidth = getMaximumTextWidth( shapeStrings );

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

    super( controlGeometryNameString, content, tandem );

    // @private {MoleculeShapesModel}
    this.model = model;

    // labels for the types of geometries
    const textLabelFont = new PhetFont( 14 );

    // @private {MoleculeShapesCheckbox}
    const moleculeGeometryCheckboxTandem = tandem.createTandem( 'moleculeGeometryCheckbox' );
    this.moleculeGeometryCheckbox = new MoleculeShapesCheckbox( new Text( controlMoleculeGeometryString, {
      font: textLabelFont,
      fill: MoleculeShapesColors.moleculeGeometryNameProperty,
      tandem: moleculeGeometryCheckboxTandem.createTandem( 'labelText' )
    } ), model.showMoleculeGeometryProperty, {
      tandem: moleculeGeometryCheckboxTandem,
      layoutOptions: {
        x: 1,
        y: 0
      }
    } );
    const electronGeometryCheckboxTandem = model.isBasicsVersion ? Tandem.OPT_OUT : tandem.createTandem( 'electronGeometryCheckbox' );
    this.electronGeometryCheckbox = new MoleculeShapesCheckbox( new Text( controlElectronGeometryString, {
      font: textLabelFont,
      fill: MoleculeShapesColors.electronGeometryNameProperty,
      tandem: electronGeometryCheckboxTandem.createTandem( 'labelText' )
    } ), model.showElectronGeometryProperty, {
      tandem: electronGeometryCheckboxTandem,
      layoutOptions: {
        x: 0,
        y: 0
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

    // TODO: pointer area listeners

    content.addChild( this.moleculeGeometryCheckbox );
    content.addChild( new Node( {
      // Hide this container only when the checkbox is hidden
      visibleProperty: this.moleculeGeometryCheckbox.visibleProperty,
      children: [ this.moleculeText ],
      layoutOptions: {
        x: 1,
        y: 1,
        minContentWidth: maxGeometryWidth
      }
    } ) );
    Property.multilink( [ this.moleculeGeometryCheckbox.boundsProperty, this.moleculeText.boundsProperty, content.boundsProperty ], () => {
      const bounds = this.moleculeGeometryCheckbox.localBounds.union( this.moleculeGeometryCheckbox.boundsOf( this.moleculeText ) ).dilated( 10 );
      this.moleculeGeometryCheckbox.touchArea = this.moleculeGeometryCheckbox.mouseArea = bounds;
    } );

    if ( !model.isBasicsVersion ) {
      // basics version excludes lone-pair (electron) geometries
      content.addChild( this.electronGeometryCheckbox );
      content.addChild( new Node( {
        // Hide this container only when the checkbox is hidden
        visibleProperty: this.electronGeometryCheckbox.visibleProperty,
        children: [ this.electronText ],
        layoutOptions: {
          x: 0,
          y: 1,
          minContentWidth: maxShapeWidth
        }
      } ) );

      Property.multilink( [ this.electronGeometryCheckbox.boundsProperty, this.electronText.boundsProperty, content.boundsProperty ], () => {
        const bounds = this.electronGeometryCheckbox.localBounds.union( this.electronGeometryCheckbox.boundsOf( this.electronText ) ).dilated( 10 );
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
    this.moleculeText.text = this.getMoleculeGeometryName();
    this.electronText.text = this.getElectronGeometryName();

    // layout
    this.moleculeText.centerX = this.moleculeGeometryCheckbox.centerX;
    this.electronText.centerX = this.electronGeometryCheckbox.centerX;
  }

  /**
   * @private
   */
  getMoleculeGeometryName() {
    const name = this.model.moleculeProperty.value.getCentralVSEPRConfiguration().moleculeGeometry.string;
    if ( name === null ) {
      return shapeEmptyString;
    }
    else {
      return name;
    }
  }

  /**
   * @private
   */
  getElectronGeometryName() {
    const name = this.model.moleculeProperty.value.getCentralVSEPRConfiguration().electronGeometry.string;
    if ( name === null ) {
      return geometryEmptyString;
    }
    else {
      return name;
    }
  }
}

moleculeShapes.register( 'GeometryNamePanel', GeometryNamePanel );

export default GeometryNamePanel;