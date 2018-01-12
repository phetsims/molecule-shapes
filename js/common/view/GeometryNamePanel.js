// Copyright 2014-2017, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesCheckbox = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesCheckbox' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var controlElectronGeometryString = require( 'string!MOLECULE_SHAPES/control.electronGeometry' );
  var controlGeometryNameString = require( 'string!MOLECULE_SHAPES/control.geometryName' );
  var controlMoleculeGeometryString = require( 'string!MOLECULE_SHAPES/control.moleculeGeometry' );

  var geometryDiatomicString = require( 'string!MOLECULE_SHAPES/geometry.diatomic' );
  var geometryEmptyString = require( 'string!MOLECULE_SHAPES/geometry.empty' );
  var geometryLinearString = require( 'string!MOLECULE_SHAPES/geometry.linear' );
  var geometryOctahedralString = require( 'string!MOLECULE_SHAPES/geometry.octahedral' );
  var geometryTetrahedralString = require( 'string!MOLECULE_SHAPES/geometry.tetrahedral' );
  var geometryTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/geometry.trigonalBipyramidal' );
  var geometryTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/geometry.trigonalPlanar' );

  var shapeBentString = require( 'string!MOLECULE_SHAPES/shape.bent' );
  var shapeDiatomicString = require( 'string!MOLECULE_SHAPES/shape.diatomic' );
  var shapeEmptyString = require( 'string!MOLECULE_SHAPES/shape.empty' );
  var shapeLinearString = require( 'string!MOLECULE_SHAPES/shape.linear' );
  var shapeOctahedralString = require( 'string!MOLECULE_SHAPES/shape.octahedral' );
  var shapeSeesawString = require( 'string!MOLECULE_SHAPES/shape.seesaw' );
  var shapeSquarePlanarString = require( 'string!MOLECULE_SHAPES/shape.squarePlanar' );
  var shapeSquarePyramidalString = require( 'string!MOLECULE_SHAPES/shape.squarePyramidal' );
  var shapeTetrahedralString = require( 'string!MOLECULE_SHAPES/shape.tetrahedral' );
  var shapeTrigonalBipyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalBipyramidal' );
  var shapeTrigonalPlanarString = require( 'string!MOLECULE_SHAPES/shape.trigonalPlanar' );
  var shapeTrigonalPyramidalString = require( 'string!MOLECULE_SHAPES/shape.trigonalPyramidal' );
  var shapeTShapedString = require( 'string!MOLECULE_SHAPES/shape.tShaped' );

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
    var textLabelFont = new PhetFont( 14 );

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

    var pointerAreaXPadding = 10;
    var pointerAreaYPadding = 15;
    var pointerAreaBottomExtension = 40;
    var molecularPointerArea = this.molecularCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.molecularCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.molecularCheckbox.touchArea = this.molecularCheckbox.mouseArea = molecularPointerArea;
    var electronPointerArea = this.electronCheckbox.localBounds.dilatedXY( pointerAreaXPadding, pointerAreaYPadding )
      .withMaxY( this.electronCheckbox.localBounds.maxY + pointerAreaBottomExtension );
    this.electronCheckbox.touchArea = this.electronCheckbox.mouseArea = electronPointerArea;

    // increase our maximums if our checkbox labels are larger than the shape names
    maxGeometryWidth = Math.max( maxGeometryWidth, this.molecularCheckbox.width );
    maxShapeWidth = Math.max( maxShapeWidth, this.electronCheckbox.width );

    // layout
    var horizontalPadding = 20;
    var contentWidth = maxGeometryWidth + ( model.isBasicsVersion ? 0 : ( horizontalPadding + maxGeometryWidth ) );
    var checkboxBottom = Math.max( this.molecularCheckbox.bottom, this.electronCheckbox.bottom );
    this.molecularCheckbox.centerX = maxGeometryWidth / 2;
    this.electronCheckbox.centerX = maxGeometryWidth + horizontalPadding + maxShapeWidth / 2;
    this.molecularText.top = this.electronText.top = checkboxBottom + 10;

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
      fill: MoleculeShapesColorProfile.backgroundProperty
    }, options ) );

    var updateNames = this.updateNames.bind( this );
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
      var name = this.model.moleculeProperty.get().getCentralVSEPRConfiguration().name;
      if ( name === null ) {
        return shapeEmptyString;
      }
      else {
        return name;
      }
    },

    getElectronGeometryName: function() {
      var name = this.model.moleculeProperty.get().getCentralVSEPRConfiguration().geometry.name;
      if ( name === null ) {
        return geometryEmptyString;
      }
      else {
        return name;
      }
    }
  } );
} );

