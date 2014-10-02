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

  function getMaximumTextHeight( strings ) {
    var maxHeight = 0;
    _.each( strings, function( string ) {
      maxHeight = Math.max( maxHeight, getTextLabel( string, scratchColorProperty ).height );
    } );
    return maxHeight;
  }

  var maxGeometryWidth = getMaximumTextWidth( geometryStrings );
  var maxShapeWidth = getMaximumTextWidth( shapeStrings );
  var maxTextHeight = Math.max( getMaximumTextHeight( geometryStrings ), getMaximumTextHeight( shapeStrings ) );

  function GeometryNamePanel( moleculeProperty, showElectronGeometry, options ) {
    var self = this;

    this.moleculeProperty = moleculeProperty;
    this.showElectronGeometry = showElectronGeometry;

    this.showMolecularShapeName = new Property( false );
    this.showElectronShapeName = new Property( false );

    this.molecularText = new Text( '', { font: geometryNameFont } );
    this.electronText = new Text( '', { font: geometryNameFont } );
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

    var content = new Node();
    content.addChild( this.molecularCheckbox );
    // TODO

    MoleculeShapesPanel.call( this, geometryNameString, content, _.extend( {
      fill: MoleculeShapesColors.background
    }, options ) );

    MoleculeShapesColors.link( 'background', function( color ) {
      self.fill = color;
    } );
    MoleculeShapesColors.link( 'controlPanelBorder', function( color ) {
      self.stroke = color;
    } );


  }

/*
        final PSwing molecularCheckbox = new PropertyCheckBoxNode( UserComponents.moleculeGeometryCheckBox, Strings.CONTROL__MOLECULE_GEOMETRY, showMolecularShapeName, MoleculeShapesColor.MOLECULAR_GEOMETRY_NAME ) {{
            // center within it's "column"
            setOffset( ( MAX_SHAPE_WIDTH - getFullBounds().getWidth() ) / 2, 0 );
        }};

        PSwing electronCheckbox = new PropertyCheckBoxNode( UserComponents.electronGeometryCheckBox, Strings.CONTROL__ELECTRON_GEOMETRY, showElectronShapeName, MoleculeShapesColor.ELECTRON_GEOMETRY_NAME ) {{
            // center within it's "column"
            setOffset( MAX_SHAPE_WIDTH + PADDING_BETWEEN_LABELS + ( MAX_GEOMETRY_WIDTH - getFullBounds().getWidth() ) / 2, 0 );
        }};

        // calculate where we should put our labels vertically
        readoutHeight = Math.max( molecularCheckbox.getFullBounds().getHeight(), electronCheckbox.getFullBounds().getHeight() ) + VERTICAL_PADDING;

        // create a spacer, so that our control panel will never shrink below this amount of room
        final PNode spacer = new Spacer( 0, 0,
                                         MAX_GEOMETRY_WIDTH + ( showElectronGeometry ? ( MAX_SHAPE_WIDTH + PADDING_BETWEEN_LABELS ) : 0 ),
                                         readoutHeight + MAX_TEXT_HEIGHT );

        addChild( spacer );
        addChild( molecularCheckbox );
        if ( showElectronGeometry ) {
            addChild( electronCheckbox );
        }

        * visibility listeners

        // listener will run things in the Swing thread
        showMolecularShapeName.addObserver( new SimpleObserver() {
            public void update() {
                updateMolecularText( true );
            }
        }, false );
        // but execute it now since we are being initialized
        updateMolecularText( false );

        // listener will run things in the Swing thread
        showElectronShapeName.addObserver( new SimpleObserver() {
            public void update() {
                updateElectronText( false );
            }
        }, false );
        // but execute it now since we are being initialized
        updateElectronText( true );

        * change listeners

        final VoidFunction1<Bond<PairGroup>> updateFunction = new VoidFunction1<Bond<PairGroup>>() {
            public void apply( Bond<PairGroup> bond ) {
                updateMolecularText( true );
                updateElectronText( true );
            }
        };
        ChangeObserver<Molecule> onMoleculeChange = new ChangeObserver<Molecule>() {
            public void update( Molecule newValue, Molecule oldValue ) {
                if ( oldValue != null ) {
                    oldValue.onBondChanged.removeListener( updateFunction );
                }
                newValue.onBondChanged.addListener( updateFunction );
                updateMolecularText( true );
                updateElectronText( true );
            }
        };
        molecule.addObserver( onMoleculeChange );

        // trigger adding listeners to the current molecule
        onMoleculeChange.update( molecule.get(), null );
    }

    private void updateMolecularText( boolean useSwingThread ) {
        final String name = molecule.get().getCentralVseprConfiguration().name;
        final boolean visible = showMolecularShapeName.get();

        Runnable runnable = new Runnable() {
            public void run() {
                // remove old readout
                if ( molecularText != null ) {
                    removeChild( molecularText );
                }

                molecularText = getTextLabel( ( name == null ? Strings.SHAPE__EMPTY : name ),
                                              MoleculeShapesColor.MOLECULAR_GEOMETRY_NAME.getProperty() ); // replace the unknown value
                molecularText.setOffset( ( MAX_SHAPE_WIDTH - molecularText.getFullBounds().getWidth() ) / 2, readoutHeight );
                molecularText.setVisible( visible );

                addChild( molecularText );
            }
        };

        if ( useSwingThread ) {
            SwingUtilities.invokeLater( runnable );
        }
        else {
            runnable.run();
        }
    }

    private void updateElectronText( boolean useSwingThread ) {
        if ( !showElectronGeometry ) {
            return;
        }
        final String name = molecule.get().getCentralVseprConfiguration().geometry.name;
        final boolean visible = showElectronShapeName.get();

        Runnable runnable = new Runnable() {
            public void run() {
                if ( electronText != null ) {
                    removeChild( electronText );
                }
                double columnOffset = MAX_SHAPE_WIDTH + PADDING_BETWEEN_LABELS; // compensate for the extra needed room

                electronText = getTextLabel( ( name == null ? Strings.GEOMETRY__EMPTY : name ),
                                             MoleculeShapesColor.ELECTRON_GEOMETRY_NAME.getProperty() ); // replace the unknown value
                electronText.setOffset( columnOffset + ( MAX_SHAPE_WIDTH - electronText.getFullBounds().getWidth() ) / 2, readoutHeight );
                electronText.setVisible( visible );

                addChild( electronText );
            }
        };
        if ( useSwingThread ) {
            SwingUtilities.invokeLater( runnable );
        }
        else {
            runnable.run();
        }
    }

    private static PText getTextLabel( final String label, final Property<Color> color ) {
        return new PText( label ) {{
            setFont( MoleculeShapesConstants.GEOMETRY_NAME_FONT );

            color.addObserver( new SimpleObserver() {
                public void update() {
                    setTextPaint( color.get() );
                }
            } );
        }};
    }

    private static double getMaximumTextWidth( List<String> strings ) {
        double maxWidth = 0;
        for ( String string : strings ) {
            maxWidth = Math.max( maxWidth, getTextLabel( string, new Property<Color>( Color.WHITE ) ).getFullBounds().getWidth() );
        }
        return maxWidth;
    }

    private static double getMaximumTextHeight( List<String> strings ) {
        double maxHeight = 0;
        for ( String string : strings ) {
            maxHeight = Math.max( maxHeight, getTextLabel( string, new Property<Color>( Color.WHITE ) ).getFullBounds().getHeight() );
        }
        return maxHeight;
    }*/

  return inherit( MoleculeShapesPanel, GeometryNamePanel, {

  } );
} );

