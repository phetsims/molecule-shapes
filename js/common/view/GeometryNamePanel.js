// Copyright 2014-2015, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MoleculeShapesCheckBox = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesCheckBox' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );

  // strings
  var geometryNameString = require( 'string!MOLECULE_SHAPES/control.geometryName' );
  var moleculeGeometryString = require( 'string!MOLECULE_SHAPES/control.moleculeGeometry' );
  var electronGeometryString = require( 'string!MOLECULE_SHAPES/control.electronGeometry' );

  var geometryEmptyString = require( 'string!MOLECULE_SHAPES/geometry.empty' );
  var geometryDiatomicString = require( 'string!MOLECULE_SHAPES/geometry.diatomic' );
  var geometryLinearString = require( 'string!MOLECULE_SHAPES/geometry.linear' );
  var geometryTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/geometry.trigonalPlanar' );
  var geometryTetrahedralString = require( 'string!MOLECULE_SHAPES/geometry.tetrahedral' );
  var geometryTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/geometry.trigonalBipyramidal' );
  var geometryOctahedralString = require( 'string!MOLECULE_SHAPES/geometry.octahedral' );

  var shapeEmptyString = require( 'string!MOLECULE_SHAPES/shape.empty' );
  var shapeDiatomicString = require( 'string!MOLECULE_SHAPES/shape.diatomic' );
  var shapeLinearString = require( 'string!MOLECULE_SHAPES/shape.linear' );
  var shapeBentString = require( 'string!MOLECULE_SHAPES/shape.bent' );
  var shapeTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/shape.trigonalPlanar' );
  var shapeTrigonalPyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalPyramidal' );
  var shapeTShapedString = require( 'string!MOLECULE_SHAPES/shape.tShaped' );
  var shapeTetrahedralString = require( 'string!MOLECULE_SHAPES/shape.tetrahedral' );
  var shapeSeesawString = require( 'string!MOLECULE_SHAPES/shape.seesaw' );
  var shapeSquarePlanarString = require( 'string!MOLECULE_SHAPES/shape.squarePlanar' );
  var shapeTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalBipyramidal' );
  var shapeSquarePyramidalString = require( 'string!MOLECULE_SHAPES/shape.squarePyramidal' );
  var shapeOctahedralString = require( 'string!MOLECULE_SHAPES/shape.octahedral' );

  // string list needed to compute maximum label bounds
  var geometryStrings = [
    geometryEmptyString,
    geometryDiatomicString,
    geometryLinearString,
    geometryTrigonalPlanarString,
    geometryTetrahedralString,
    geometryTrigonalBipyramidalString,
    geometryOctahedralString
  ];

  // string list needed to compute maximum label bounds
  var shapeStrings = [
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

  var geometryNameFont = new PhetFont( 16 );

  function getMaximumTextWidth( strings ) {
    var maxWidth = 0;
    _.each( strings, function( string ) {
      maxWidth = Math.max( maxWidth, new Text( string, { font: geometryNameFont } ).width );
    } );
    return maxWidth;
  }

  var maxGeometryWidth = getMaximumTextWidth( geometryStrings );
  var maxShapeWidth = getMaximumTextWidth( shapeStrings );

  function GeometryNamePanel( model, options ) {
    this.model = model;

    // text fields that will show the name of the geometry (uses string placeholders for height)
    this.molecularText = new Text( 'X', { font: geometryNameFont, pickable: false } );
    this.electronText = new Text( 'Y', { font: geometryNameFont, pickable: false } );
    MoleculeShapesColors.linkAttribute( 'moleculeGeometryName', this.molecularText, 'fill' );
    MoleculeShapesColors.linkAttribute( 'electronGeometryName', this.electronText, 'fill' );
    model.linkAttribute( 'showMolecularShapeName', this.molecularText, 'visible' );
    model.linkAttribute( 'showElectronShapeName', this.electronText, 'visible' );

    // labels for the types of geometries
    var textLabelFont = new PhetFont( 14 );
    this.molecularTextLabel = new Text( moleculeGeometryString, { font: textLabelFont } );
    this.electronTextLabel = new Text( electronGeometryString, { font: textLabelFont } );
    MoleculeShapesColors.linkAttribute( 'moleculeGeometryName', this.molecularTextLabel, 'fill' );
    MoleculeShapesColors.linkAttribute( 'electronGeometryName', this.electronTextLabel, 'fill' );

    this.molecularCheckbox = new MoleculeShapesCheckBox( this.molecularTextLabel, model.showMolecularShapeNameProperty, {} );
    this.electronCheckbox = new MoleculeShapesCheckBox( this.electronTextLabel, model.showElectronShapeNameProperty, {} );

    var pointerAreaXPadding = 10;
    var pointerAreaYPadding = 15;
    var pointerAreaBottomExtension = 40;
    var molecularPointerArea = this.molecularCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.molecularCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.molecularCheckbox.touchArea = this.molecularCheckbox.mouseArea = molecularPointerArea;
    var electronPointerArea = this.electronCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.electronCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.electronCheckbox.touchArea = this.electronCheckbox.mouseArea = electronPointerArea;

    // increase our maximums if our check box labels are larger than the shape names
    maxGeometryWidth = Math.max( maxGeometryWidth, this.molecularCheckbox.width );
    maxShapeWidth = Math.max( maxShapeWidth, this.electronCheckbox.width );

    // layout
    var checkBoxBottom = Math.max( this.molecularCheckbox.bottom, this.electronCheckbox.bottom );
    this.molecularCheckbox.centerX = maxGeometryWidth / 2;
    this.electronCheckbox.centerX = maxGeometryWidth + 20 + maxShapeWidth / 2;
    this.molecularText.top = this.electronText.top = checkBoxBottom + 10;

    var content = new Node();
    content.addChild( this.molecularCheckbox );
    content.addChild( this.molecularText );
    if ( !model.isBasicsVersion ) {
      // basics version excludes lone-pair (electron) geometries
      content.addChild( this.electronCheckbox );
      content.addChild( this.electronText );
    }

    MoleculeShapesPanel.call( this, geometryNameString, content, _.extend( {
      fill: MoleculeShapesColors.background
    }, options ) );

    var updateNames = this.updateNames.bind( this );
    model.link( 'molecule', function( newMolecule, oldMolecule ) {
      if ( oldMolecule ) {
        oldMolecule.off( 'bondChanged', updateNames );
      }
      if ( newMolecule ) {
        newMolecule.on( 'bondChanged', updateNames );
      }
      updateNames();
    } );
  }

  return inherit( MoleculeShapesPanel, GeometryNamePanel, {
    updateNames: function() {
      this.molecularText.text = this.getMolecularGeometryName();
      this.electronText.text = this.getElectronGeometryName();

      // layout
      this.molecularText.centerX = this.molecularCheckbox.centerX;
      this.electronText.centerX = this.electronCheckbox.centerX;
    },

    getMolecularGeometryName: function() {
      var name = this.model.molecule.getCentralVSEPRConfiguration().name;
      if ( name === null ) {
        return shapeEmptyString;
      }
      else {
        return name;
      }
    },

    getElectronGeometryName: function() {
      var name = this.model.molecule.getCentralVSEPRConfiguration().geometry.name;
      if ( name === null ) {
        return geometryEmptyString;
      }
      else {
        return name;
      }
    }
  } );
} );

