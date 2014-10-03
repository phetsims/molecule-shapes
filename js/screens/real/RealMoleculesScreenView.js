//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Real Molecules' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/view/MoleculeShapesPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var OptionsNode = require( 'MOLECULE_SHAPES/view/OptionsNode' );
  var MoleculeView = require( 'MOLECULE_SHAPES/view/3d/MoleculeView' );

  var optionsString = require( 'string!MOLECULE_SHAPES/control.options' );
  var realViewString = require( 'string!MOLECULE_SHAPES/control.realView' );
  var modelViewString = require( 'string!MOLECULE_SHAPES/control.modelView' );

  /**
   * Constructor for the RealMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function RealMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );

    this.moleculeView = new MoleculeView( model, model.molecule );
    this.threeScene.add( this.moleculeView );

    this.addChild( new MoleculeShapesPanel( optionsString, new OptionsNode( model.showLonePairsProperty, model.showBondAnglesProperty, model.isBasicsVersion ), {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10
    } ) );


    if ( !model.isBasicsVersion ) {
      // we offset the camera, so we don't have an exact constant. this is tuned
      var approximateVisualCenterX = this.layoutBounds.width / 2 - 100;

      // NOTE: these font sizes are scaled!
      var realViewLabel = new Text( realViewString, { font: new PhetFont( 28 ) } );
      var modelViewLabel = new Text( modelViewString, { font: new PhetFont( 28 ) } );
      MoleculeShapesColors.link( 'controlPanelText', function( color ) {
        realViewLabel.fill = modelViewLabel.fill = color;
      } );

      var horizontalSpacing = 30;

      var realRadioButton = new AquaRadioButton( model.showRealViewProperty, true, realViewLabel, {
        scale: 0.7,
        top: this.layoutBounds.top + 10,
        right: approximateVisualCenterX - horizontalSpacing / 2
      } );
      var modelRadioButton = new AquaRadioButton( model.showRealViewProperty, false, modelViewLabel, {
        scale: 0.7,
        top: this.layoutBounds.top + 10,
        left: approximateVisualCenterX + horizontalSpacing / 2
      } );
      this.addChild( realRadioButton );
      this.addChild( modelRadioButton );
    }
  }

  return inherit( MoleculeShapesScreenView, RealMoleculesScreenView );
} );
