// Copyright 2014-2020, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';
import MoleculeShapesCheckbox from './MoleculeShapesCheckbox.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';
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

let maxGeometryWidth = getMaximumTextWidth( geometryStrings );
let maxShapeWidth = getMaximumTextWidth( shapeStrings );

class GeometryNamePanel extends MoleculeShapesPanel {
  /**
   * @param {MoleculeShapesModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    const content = new Node();
    super( controlGeometryNameString, content, merge( {
      fill: MoleculeShapesColorProfile.backgroundProperty,
      tandem: tandem
    }, options ) );

    this.model = model; // @private {MoleculeShapesModel}

    // @private - text fields that will show the name of the geometry (uses string placeholders for height)
    this.molecularText = new Text( 'X', {
      font: geometryNameFont,
      pickable: false,
      fill: MoleculeShapesColorProfile.moleculeGeometryNameProperty,
      tandem: tandem.createTandem( 'molecularText' )
    } );
    // @private
    this.electronText = new Text( 'Y', {
      font: geometryNameFont,
      pickable: false,
      fill: MoleculeShapesColorProfile.electronGeometryNameProperty,
      tandem: tandem.createTandem( 'electronText' )
    } );
    model.showMolecularShapeNameProperty.linkAttribute( this.molecularText, 'visible' );
    model.showElectronShapeNameProperty.linkAttribute( this.electronText, 'visible' );

    // labels for the types of geometries
    const textLabelFont = new PhetFont( 14 );

    // @private
    this.molecularTextLabel = new Text( controlMoleculeGeometryString, {
      font: textLabelFont,
      fill: MoleculeShapesColorProfile.moleculeGeometryNameProperty
    } );

    // @private
    this.electronTextLabel = new Text( controlElectronGeometryString, {
      font: textLabelFont,
      fill: MoleculeShapesColorProfile.electronGeometryNameProperty
    } );

    // @private
    this.molecularCheckbox = new MoleculeShapesCheckbox( this.molecularTextLabel, model.showMolecularShapeNameProperty, {
      tandem: tandem.createTandem( 'molecularCheckbox' )
    } );
    this.electronCheckbox = new MoleculeShapesCheckbox( this.electronTextLabel, model.showElectronShapeNameProperty, {
      tandem: tandem.createTandem( 'electronCheckbox' )
    } );

    const pointerAreaXPadding = 10;
    const pointerAreaYPadding = 15;
    const pointerAreaBottomExtension = 40;
    const molecularPointerArea = this.molecularCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.molecularCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.molecularCheckbox.touchArea = this.molecularCheckbox.mouseArea = molecularPointerArea;
    const electronPointerArea = this.electronCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.electronCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.electronCheckbox.touchArea = this.electronCheckbox.mouseArea = electronPointerArea;

    // increase our maximums if our checkbox labels are larger than the shape names
    maxGeometryWidth = Math.max( maxGeometryWidth, this.molecularCheckbox.width );
    maxShapeWidth = Math.max( maxShapeWidth, this.electronCheckbox.width );

    // layout
    const horizontalPadding = 20;
    const contentWidth = maxGeometryWidth + ( model.isBasicsVersion ? 0 : ( horizontalPadding + maxGeometryWidth ) );
    const checkboxBottom = Math.max( this.molecularCheckbox.bottom, this.electronCheckbox.bottom );
    this.molecularCheckbox.centerX = maxGeometryWidth / 2;
    this.electronCheckbox.centerX = maxGeometryWidth + horizontalPadding + maxShapeWidth / 2;
    this.molecularText.top = this.electronText.top = checkboxBottom + 10;

    // Make sure we include the extra (possibly unused) space so that the panel can contain all of the content,
    // regardless of which string is shown. See https://github.com/phetsims/molecule-shapes/issues/138
    content.localBounds = new Bounds2( 0, this.molecularCheckbox.top, contentWidth, this.molecularText.bottom );

    content.addChild( this.molecularCheckbox );
    content.addChild( this.molecularText );
    if ( !model.isBasicsVersion ) {
      // basics version excludes lone-pair (electron) geometries
      content.addChild( this.electronCheckbox );
      content.addChild( this.electronText );
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

    this.maxWidth = 900; // See https://github.com/phetsims/molecule-shapes/issues/137
  }

  /**
   * @private
   */
  updateNames() {
    this.molecularText.text = this.getMolecularGeometryName();
    this.electronText.text = this.getElectronGeometryName();

    // layout
    this.molecularText.centerX = this.molecularCheckbox.centerX;
    this.electronText.centerX = this.electronCheckbox.centerX;
  }

  /**
   * @private
   */
  getMolecularGeometryName() {
    const name = this.model.moleculeProperty.value.getCentralVSEPRConfiguration().name;
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
    const name = this.model.moleculeProperty.value.getCentralVSEPRConfiguration().geometry.name;
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