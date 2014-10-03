//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Shows the molecular and electron geometry names, and has checkboxes which allow toggling their visibility
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var CheckBox = require( 'SUN/CheckBox' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/view/MoleculeShapesPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );

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

  var scratchColorProperty = new Property( Color.WHITE );

  function getTextLabel( label, colorProperty ) {
    var text = new Text( label, {
      font: geometryNameFont
    } );
    colorProperty.link( function( color ) {
      text.fill = color;
    } );
    return text;
  }

  function getMaximumTextWidth( strings ) {
    var maxWidth = 0;
    _.each( strings, function( string ) {
      maxWidth = Math.max( maxWidth, getTextLabel( string, scratchColorProperty ).width );
    } );
    return maxWidth;
  }

  var maxGeometryWidth = getMaximumTextWidth( geometryStrings );
  var maxShapeWidth = getMaximumTextWidth( shapeStrings );

  function GeometryNamePanel( moleculeProperty, showElectronGeometry, options ) {
    var self = this;

    // TODO: reset these!
    this.moleculeProperty = moleculeProperty;
    this.showElectronGeometry = showElectronGeometry;

    this.showMolecularShapeName = new Property( false );
    this.showElectronShapeName = new Property( false );

    this.molecularText = new Text( 'X', { font: geometryNameFont } );
    this.electronText = new Text( 'Y', { font: geometryNameFont } );
    this.showMolecularShapeName.link( function( enabled ) { self.molecularText.visible = enabled; } );
    this.showElectronShapeName.link( function( enabled ) { self.electronText.visible = enabled; } );

    this.molecularTextLabel = new Text( moleculeGeometryString, { font: new PhetFont( 14 ) } );
    this.electronTextLabel = new Text( electronGeometryString, { font: new PhetFont( 14 ) } );
    MoleculeShapesColors.link( 'moleculeGeometryName', function( color ) {
      self.molecularText.fill = self.molecularTextLabel.fill = color;
    } );
    MoleculeShapesColors.link( 'electronGeometryName', function( color ) {
      self.electronText.fill = self.electronTextLabel.fill = color;
    } );

    this.molecularCheckbox = new CheckBox( this.molecularTextLabel, this.showMolecularShapeName, {} );
    this.electronCheckbox = new CheckBox( this.electronTextLabel, this.showElectronShapeName, {} );

    this.molecularCheckbox.touchArea = this.molecularCheckbox.mouseArea = this.molecularCheckbox.localBounds.dilatedXY( 10, 15 ).withMaxY( this.molecularCheckbox.localBounds.maxY + 40 );
    this.electronCheckbox.touchArea = this.electronCheckbox.mouseArea = this.electronCheckbox.localBounds.dilatedXY( 10, 15 ).withMaxY( this.electronCheckbox.localBounds.maxY + 40 );

    maxGeometryWidth = Math.max( maxGeometryWidth, this.molecularCheckbox.width );
    maxShapeWidth = Math.max( maxShapeWidth, this.electronCheckbox.width );
    var checkBoxBottom = Math.max( this.molecularCheckbox.bottom, this.electronCheckbox.bottom );

    // layout
    this.molecularCheckbox.centerX = maxGeometryWidth / 2;
    this.electronCheckbox.centerX = maxGeometryWidth + 20 + maxShapeWidth / 2;
    this.molecularText.top = this.electronText.top = checkBoxBottom + 10;

    var content = new Node();
    content.addChild( this.molecularCheckbox );
    content.addChild( this.molecularText );
    if ( showElectronGeometry ) {
      content.addChild( this.electronCheckbox );
      content.addChild( this.electronText );
    }

    MoleculeShapesPanel.call( this, geometryNameString, content, _.extend( {
      fill: MoleculeShapesColors.background
    }, options ) );

    MoleculeShapesColors.link( 'background', function( color ) {
      self.fill = color;
    } );
    MoleculeShapesColors.link( 'controlPanelBorder', function( color ) {
      self.stroke = color;
    } );

    var updateNames = this.updateNames.bind( this );

    moleculeProperty.link( function( newMolecule, oldMolecule ) {
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
      this.molecularText.centerX = this.molecularCheckbox.centerX;
      this.electronText.centerX = this.electronCheckbox.centerX;
    },

    getMolecularGeometryName: function() {
      var name = this.moleculeProperty.value.getCentralVseprConfiguration().name;
      if ( name === null ) {
        return shapeEmptyString;
      } else {
        return name;
      }
    },

    getElectronGeometryName: function() {
      var name = this.moleculeProperty.value.getCentralVseprConfiguration().geometry.name;
      if ( name === null ) {
        return geometryEmptyString;
      } else {
        return name;
      }
    }
  } );
} );

