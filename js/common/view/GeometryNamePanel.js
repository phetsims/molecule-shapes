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

    options = merge( {
      fill: MoleculeShapesColorProfile.backgroundProperty,
      tandem: tandem
    }, options );

    const content = new Node();
    super( controlGeometryNameString, content );

    this.model = model; // @private {MoleculeShapesModel}

    // @private - text fields that will show the name of the geometry (uses string placeholders for height)
    this.molecularText = new Text( 'X', {
      font: geometryNameFont,
      pickable: false,
      fill: MoleculeShapesColorProfile.moleculeGeometryNameProperty
    } );
    // @private
    this.electronText = new Text( 'Y', {
      font: geometryNameFont,
      pickable: false,
      fill: MoleculeShapesColorProfile.electronGeometryNameProperty
    } );
    model.showMoleculeGeometryProperty.linkAttribute( this.molecularText, 'visible' );
    model.showElectronGeometryProperty.linkAttribute( this.electronText, 'visible' );

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
    this.moleculeGeometryCheckbox = new MoleculeShapesCheckbox( this.molecularTextLabel, model.showMoleculeGeometryProperty, {
      tandem: tandem.createTandem( 'moleculeGeometryCheckbox' )
    } );
    this.electronGeometryCheckbox = new MoleculeShapesCheckbox( this.electronTextLabel, model.showElectronGeometryProperty, {
      tandem: tandem.createTandem( 'electronGeometryCheckbox' )
    } );

    const pointerAreaXPadding = 10;
    const pointerAreaYPadding = 15;
    const pointerAreaBottomExtension = 40;
    const molecularPointerArea = this.moleculeGeometryCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.moleculeGeometryCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.moleculeGeometryCheckbox.touchArea = this.moleculeGeometryCheckbox.mouseArea = molecularPointerArea;
    const electronPointerArea = this.electronGeometryCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.electronGeometryCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.electronGeometryCheckbox.touchArea = this.electronGeometryCheckbox.mouseArea = electronPointerArea;

    // increase our maximums if our checkbox labels are larger than the shape names
    maxGeometryWidth = Math.max( maxGeometryWidth, this.moleculeGeometryCheckbox.width );
    maxShapeWidth = Math.max( maxShapeWidth, this.electronGeometryCheckbox.width );

    // layout
    const horizontalPadding = 20;
    const contentWidth = maxGeometryWidth + ( model.isBasicsVersion ? 0 : ( horizontalPadding + maxGeometryWidth ) );
    const checkboxBottom = Math.max( this.moleculeGeometryCheckbox.bottom, this.electronGeometryCheckbox.bottom );
    this.moleculeGeometryCheckbox.centerX = maxGeometryWidth / 2;
    this.electronGeometryCheckbox.centerX = maxGeometryWidth + horizontalPadding + maxShapeWidth / 2;
    this.molecularText.top = this.electronText.top = checkboxBottom + 10;

    // Make sure we include the extra (possibly unused) space so that the panel can contain all of the content,
    // regardless of which string is shown. See https://github.com/phetsims/molecule-shapes/issues/138
    content.localBounds = new Bounds2( 0, this.moleculeGeometryCheckbox.top, contentWidth, this.molecularText.bottom );

    content.addChild( this.moleculeGeometryCheckbox );
    content.addChild( this.molecularText );
    if ( !model.isBasicsVersion ) {
      // basics version excludes lone-pair (electron) geometries
      content.addChild( this.electronGeometryCheckbox );
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

    this.mutate( options );

    this.maxWidth = 900; // See https://github.com/phetsims/molecule-shapes/issues/137
  }

  /**
   * @private
   */
  updateNames() {
    this.molecularText.text = this.getMolecularGeometryName();
    this.electronText.text = this.getElectronGeometryName();

    // layout
    this.molecularText.centerX = this.moleculeGeometryCheckbox.centerX;
    this.electronText.centerX = this.electronGeometryCheckbox.centerX;
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