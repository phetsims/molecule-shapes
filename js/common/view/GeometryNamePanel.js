// Copyright 2014-2019, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesCheckbox = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesCheckbox' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const controlElectronGeometryString = require( 'string!MOLECULE_SHAPES/control.electronGeometry' );
  const controlGeometryNameString = require( 'string!MOLECULE_SHAPES/control.geometryName' );
  const controlMoleculeGeometryString = require( 'string!MOLECULE_SHAPES/control.moleculeGeometry' );

  const geometryDiatomicString = require( 'string!MOLECULE_SHAPES/geometry.diatomic' );
  const geometryEmptyString = require( 'string!MOLECULE_SHAPES/geometry.empty' );
  const geometryLinearString = require( 'string!MOLECULE_SHAPES/geometry.linear' );
  const geometryOctahedralString = require( 'string!MOLECULE_SHAPES/geometry.octahedral' );
  const geometryTetrahedralString = require( 'string!MOLECULE_SHAPES/geometry.tetrahedral' );
  const geometryTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/geometry.trigonalBipyramidal' );
  const geometryTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/geometry.trigonalPlanar' );

  const shapeBentString = require( 'string!MOLECULE_SHAPES/shape.bent' );
  const shapeDiatomicString = require( 'string!MOLECULE_SHAPES/shape.diatomic' );
  const shapeEmptyString = require( 'string!MOLECULE_SHAPES/shape.empty' );
  const shapeLinearString = require( 'string!MOLECULE_SHAPES/shape.linear' );
  const shapeOctahedralString = require( 'string!MOLECULE_SHAPES/shape.octahedral' );
  const shapeSeesawString = require( 'string!MOLECULE_SHAPES/shape.seesaw' );
  const shapeSquarePlanarString = require( 'string!MOLECULE_SHAPES/shape.squarePlanar' );
  const shapeSquarePyramidalString = require( 'string!MOLECULE_SHAPES/shape.squarePyramidal' );
  const shapeTetrahedralString = require( 'string!MOLECULE_SHAPES/shape.tetrahedral' );
  const shapeTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalBipyramidal' );
  const shapeTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/shape.trigonalPlanar' );
  const shapeTrigonalPyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalPyramidal' );
  const shapeTShapedString = require( 'string!MOLECULE_SHAPES/shape.tShaped' );

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
    _.each( strings, function( string ) {
      maxWidth = Math.max( maxWidth, new Text( string, { font: geometryNameFont } ).width );
    } );
    return maxWidth;
  }

  let maxGeometryWidth = getMaximumTextWidth( geometryStrings );
  let maxShapeWidth = getMaximumTextWidth( shapeStrings );

  function GeometryNamePanel( model, options ) {
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
    this.molecularCheckbox = new MoleculeShapesCheckbox( this.molecularTextLabel, model.showMolecularShapeNameProperty, {} );
    this.electronCheckbox = new MoleculeShapesCheckbox( this.electronTextLabel, model.showElectronShapeNameProperty, {} );

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

    const content = new Node( {
      // Make sure we include the extra (possibly unused) space so that the panel can contain all of the content,
      // regardless of which string is shown. See https://github.com/phetsims/molecule-shapes/issues/138
      localBounds: new Bounds2( 0, this.molecularCheckbox.top, contentWidth, this.molecularText.bottom )
    } );
    content.addChild( this.molecularCheckbox );
    content.addChild( this.molecularText );
    if ( !model.isBasicsVersion ) {
      // basics version excludes lone-pair (electron) geometries
      content.addChild( this.electronCheckbox );
      content.addChild( this.electronText );
    }

    MoleculeShapesPanel.call( this, controlGeometryNameString, content, merge( {
      fill: MoleculeShapesColorProfile.backgroundProperty
    }, options ) );

    const updateNames = this.updateNames.bind( this );
    model.moleculeProperty.link( function( newMolecule, oldMolecule ) {
      if ( oldMolecule ) {
        oldMolecule.off( 'bondChanged', updateNames );
      }
      if ( newMolecule ) {
        newMolecule.on( 'bondChanged', updateNames );
      }
      updateNames();
    } );

    this.maxWidth = 900; // See https://github.com/phetsims/molecule-shapes/issues/137
  }

  moleculeShapes.register( 'GeometryNamePanel', GeometryNamePanel );

  return inherit( MoleculeShapesPanel, GeometryNamePanel, {
    /**
     * @private
     */
    updateNames: function() {
      this.molecularText.text = this.getMolecularGeometryName();
      this.electronText.text = this.getElectronGeometryName();

      // layout
      this.molecularText.centerX = this.molecularCheckbox.centerX;
      this.electronText.centerX = this.electronCheckbox.centerX;
    },

    /**
     * @private
     */
    getMolecularGeometryName: function() {
      const name = this.model.moleculeProperty.get().getCentralVSEPRConfiguration().name;
      if ( name === null ) {
        return shapeEmptyString;
      }
      else {
        return name;
      }
    },

    getElectronGeometryName: function() {
      const name = this.model.moleculeProperty.get().getCentralVSEPRConfiguration().geometry.name;
      if ( name === null ) {
        return geometryEmptyString;
      }
      else {
        return name;
      }
    }
  } );
} );

