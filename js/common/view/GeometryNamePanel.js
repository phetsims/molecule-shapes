// Copyright 2014-2015, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MoleculeShapesCheckBox = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesCheckBox' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );

  // strings
  var controlGeometryNameString = require( 'string!MOLECULE_SHAPES/control.geometryName' );
  var controlMoleculeGeometryString = require( 'string!MOLECULE_SHAPES/control.moleculeGeometry' );
  var controlElectronGeometryString = require( 'string!MOLECULE_SHAPES/control.electronGeometry' );

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
    this.model = model; // @private {MoleculeShapesModel}

    // text fields that will show the name of the geometry (uses string placeholders for height)
    this.molecularText = new Text( 'X', { font: geometryNameFont, pickable: false } ); // @private
    this.electronText = new Text( 'Y', { font: geometryNameFont, pickable: false } ); // @private
    MoleculeShapesColors.linkAttribute( 'moleculeGeometryName', this.molecularText, 'fill' );
    MoleculeShapesColors.linkAttribute( 'electronGeometryName', this.electronText, 'fill' );
    model.linkAttribute( 'showMolecularShapeName', this.molecularText, 'visible' );
    model.linkAttribute( 'showElectronShapeName', this.electronText, 'visible' );

    // labels for the types of geometries
    var textLabelFont = new PhetFont( 14 );
    this.molecularTextLabel = new Text( controlMoleculeGeometryString, { font: textLabelFont } ); // @private
    this.electronTextLabel = new Text( controlElectronGeometryString, { font: textLabelFont } ); // @private
    MoleculeShapesColors.linkAttribute( 'moleculeGeometryName', this.molecularTextLabel, 'fill' );
    MoleculeShapesColors.linkAttribute( 'electronGeometryName', this.electronTextLabel, 'fill' );

    // @private
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
    var horizontalPadding = 20;
    var contentWidth = maxGeometryWidth + ( model.isBasicsVersion ? 0 : ( horizontalPadding + maxGeometryWidth ) );
    var checkBoxBottom = Math.max( this.molecularCheckbox.bottom, this.electronCheckbox.bottom );
    this.molecularCheckbox.centerX = maxGeometryWidth / 2;
    this.electronCheckbox.centerX = maxGeometryWidth + horizontalPadding + maxShapeWidth / 2;
    this.molecularText.top = this.electronText.top = checkBoxBottom + 10;

    var content = new Node( {
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

    MoleculeShapesPanel.call( this, controlGeometryNameString, content, _.extend( {
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

