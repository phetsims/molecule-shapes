// Copyright 2014-2023, University of Colorado Boulder

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
import MoleculeShapesStrings from '../../MoleculeShapesStrings.js';
import MoleculeShapesCheckbox from './MoleculeShapesCheckbox.js';
import MoleculeShapesColors from './MoleculeShapesColors.js';
import MoleculeShapesPanel from './MoleculeShapesPanel.js';
import { emptyElectronGeometryStringProperty } from '../model/ElectronGeometry.js';
import { emptyMoleculeGeometryStringProperty } from '../model/MoleculeGeometry.js';

// string list needed to compute maximum label bounds
const electronGeometryStringProperties = [
  emptyElectronGeometryStringProperty,
  MoleculeShapesStrings.geometry.diatomicStringProperty,
  MoleculeShapesStrings.geometry.linearStringProperty,
  MoleculeShapesStrings.geometry.trigonalPlanarStringProperty,
  MoleculeShapesStrings.geometry.tetrahedralStringProperty,
  MoleculeShapesStrings.geometry.trigonalBipyramidalStringProperty,
  MoleculeShapesStrings.geometry.octahedralStringProperty
];

// string list needed to compute maximum label bounds
const moleculeGeometryStringProperties = [
  emptyMoleculeGeometryStringProperty,
  MoleculeShapesStrings.shape.diatomicStringProperty,
  MoleculeShapesStrings.shape.linearStringProperty,
  MoleculeShapesStrings.shape.bentStringProperty,
  MoleculeShapesStrings.shape.trigonalPlanarStringProperty,
  MoleculeShapesStrings.shape.trigonalPyramidalStringProperty,
  MoleculeShapesStrings.shape.tShapedStringProperty,
  MoleculeShapesStrings.shape.tetrahedralStringProperty,
  MoleculeShapesStrings.shape.seesawStringProperty,
  MoleculeShapesStrings.shape.squarePlanarStringProperty,
  MoleculeShapesStrings.shape.trigonalBipyramidalStringProperty,
  MoleculeShapesStrings.shape.squarePyramidalStringProperty,
  MoleculeShapesStrings.shape.octahedralStringProperty
];

const geometryNameFont = new PhetFont( 16 );

const MAX_INDIVIDUAL_WIDTH = 420;

function getMaximumTextWidth( stringProperties ) {
  return new DerivedProperty( stringProperties, ( ...strings ) => {
    return Math.min( MAX_INDIVIDUAL_WIDTH, Math.max( ...strings.map( string => {
      return new Text( string, { font: geometryNameFont } ).width;
    } ) ) );
  } );
}

const maxElectronGeometryWidthProperty = getMaximumTextWidth( electronGeometryStringProperties );
const maxMoleculeGeometryWidthProperty = getMaximumTextWidth( moleculeGeometryStringProperties );

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

    super( MoleculeShapesStrings.control.geometryNameStringProperty, content, tandem );

    // @private {MoleculeShapesModel}
    this.model = model;

    // labels for the types of geometries
    const textLabelFont = new PhetFont( 14 );

    // @private {MoleculeShapesCheckbox}
    const moleculeGeometryCheckboxTandem = tandem.createTandem( 'moleculeGeometryCheckbox' );
    this.moleculeGeometryCheckbox = new MoleculeShapesCheckbox( model.showMoleculeGeometryProperty, new Text( MoleculeShapesStrings.control.moleculeGeometryStringProperty, {
      font: textLabelFont,
      fill: MoleculeShapesColors.moleculeGeometryNameProperty,
      tandem: moleculeGeometryCheckboxTandem.createTandem( 'labelText' )
    } ), {
      tandem: moleculeGeometryCheckboxTandem,
      layoutOptions: {
        column: 1,
        row: 0
      }
    } );
    const electronGeometryCheckboxTandem = model.isBasicsVersion ? Tandem.OPT_OUT : tandem.createTandem( 'electronGeometryCheckbox' );
    this.electronGeometryCheckbox = new MoleculeShapesCheckbox( model.showElectronGeometryProperty, new Text( MoleculeShapesStrings.control.electronGeometryStringProperty, {
      font: textLabelFont,
      fill: MoleculeShapesColors.electronGeometryNameProperty,
      tandem: electronGeometryCheckboxTandem.createTandem( 'labelText' )
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
      fill: MoleculeShapesColors.moleculeGeometryNameProperty,
      maxWidth: MAX_INDIVIDUAL_WIDTH
    } );
    // @private {Text}
    this.electronText = new Text( 'Y', {
      visibleProperty: model.showElectronGeometryProperty,
      font: geometryNameFont,
      pickable: false,
      fill: MoleculeShapesColors.electronGeometryNameProperty,
      maxWidth: MAX_INDIVIDUAL_WIDTH
    } );

    const moleculeTextContainer = new Node( {
      // Hide this container only when the checkbox is hidden
      visibleProperty: this.moleculeGeometryCheckbox.visibleProperty,
      children: [ this.moleculeText ],
      layoutOptions: {
        column: 1,
        row: 1,
        minContentHeight: this.moleculeText.height
      }
    } );
    maxMoleculeGeometryWidthProperty.link( maxMoleculeGeometryWidth => {
      moleculeTextContainer.mutateLayoutOptions( {
        minContentWidth: maxMoleculeGeometryWidth
      } );
    } );

    // TODO: pointer area listeners

    content.addChild( this.moleculeGeometryCheckbox );
    content.addChild( moleculeTextContainer );

    Multilink.multilink( [ this.moleculeGeometryCheckbox.boundsProperty, moleculeTextContainer.boundsProperty, content.boundsProperty ], () => {
      let bounds = this.moleculeGeometryCheckbox.localBounds.union( this.moleculeGeometryCheckbox.boundsOf( moleculeTextContainer ) );
      if ( bounds.width < maxMoleculeGeometryWidthProperty.value ) {
        bounds = bounds.dilatedX( ( maxMoleculeGeometryWidthProperty.value - bounds.width ) / 2 );
      }
      bounds = bounds.dilated( 10 );
      this.moleculeGeometryCheckbox.touchArea = this.moleculeGeometryCheckbox.mouseArea = bounds;
    } );

    if ( !model.isBasicsVersion ) {
      const electronTextContainer = new Node( {
        // Hide this container only when the checkbox is hidden
        visibleProperty: this.electronGeometryCheckbox.visibleProperty,
        children: [ this.electronText ],
        layoutOptions: {
          column: 0,
          row: 1,
          minContentHeight: this.electronText.height
        }
      } );
      maxElectronGeometryWidthProperty.link( maxElectronGeometryWidth => {
        electronTextContainer.mutateLayoutOptions( {
          minContentWidth: maxElectronGeometryWidth
        } );
      } );


      // basics version excludes lone-pair (electron) geometries
      content.addChild( this.electronGeometryCheckbox );
      content.addChild( electronTextContainer );

      Multilink.multilink( [ this.electronGeometryCheckbox.boundsProperty, electronTextContainer.boundsProperty, content.boundsProperty ], () => {
        let bounds = this.electronGeometryCheckbox.localBounds.union( this.electronGeometryCheckbox.boundsOf( electronTextContainer ) );
        if ( bounds.width < maxElectronGeometryWidthProperty.value ) {
          bounds = bounds.dilatedX( ( maxElectronGeometryWidthProperty.value - bounds.width ) / 2 );
        }
        bounds = bounds.dilated( 10 );
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
  }

  /**
   * @private
   */
  updateNames() {
    this.moleculeText.stringProperty = this.getMoleculeGeometryName();
    this.electronText.stringProperty = this.getElectronGeometryName();

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
      return emptyMoleculeGeometryStringProperty;
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
      return emptyElectronGeometryStringProperty;
    }
    else {
      return nameProperty;
    }
  }
}

moleculeShapes.register( 'GeometryNamePanel', GeometryNamePanel );

export default GeometryNamePanel;