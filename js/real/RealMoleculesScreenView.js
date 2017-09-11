// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the 'Real Molecules' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var ChemUtils = require( 'NITROGLYCERIN/ChemUtils' );
  var ComboBox = require( 'SUN/ComboBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );
  var Node = require( 'SCENERY/nodes/Node' );
  var OptionsNode = require( 'MOLECULE_SHAPES/common/view/OptionsNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RealMoleculeShape = require( 'MOLECULE_SHAPES/common/model/RealMoleculeShape' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );

  var controlModelViewString = require( 'string!MOLECULE_SHAPES/control.modelView' );
  var controlMoleculeString = require( 'string!MOLECULE_SHAPES/control.molecule' );
  var controlOptionsString = require( 'string!MOLECULE_SHAPES/control.options' );
  var controlRealViewString = require( 'string!MOLECULE_SHAPES/control.realView' );

  /**
   * Constructor for the RealMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function RealMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );
    var self = this;

    this.model = model; // @private {MoleculeShapesModel}
    this.moleculeView = new MoleculeView( model, this, model.molecule ); // @public
    this.addMoleculeView( this.moleculeView );

    var comboBoxListContainer = new Node();
    var comboBoxMolecules = model.isBasicsVersion ? RealMoleculeShape.TAB_2_BASIC_MOLECULES : RealMoleculeShape.TAB_2_MOLECULES;
    var comboBox = new ComboBox( _.map( comboBoxMolecules, function( realMoleculeShape ) {
      return {
        value: realMoleculeShape,
        node: new RichText( ChemUtils.toSubscript( realMoleculeShape.displayName ), {
          // default font is OK
        } )
      };
    } ), model.realMoleculeShapeProperty, comboBoxListContainer, {} );
    var optionsNode = new OptionsNode( model );

    // calculate the maximum width, so we can make sure our panels are the same width by matching xMargins
    var maxWidth = Math.max( optionsNode.width, comboBox.width );
    var maxExternalWidth = 350; // How big the panels can get before really interfering

    var moleculePanel = new MoleculeShapesPanel( controlMoleculeString, comboBox, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      xMargin: ( maxWidth - comboBox.width ) / 2 + 15
    } );
    var optionsPanel = new MoleculeShapesPanel( controlOptionsString, optionsNode, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: moleculePanel.bottom + 10,
      xMargin: ( maxWidth - optionsNode.width ) / 2 + 15
    } );
    this.addChild( moleculePanel );
    this.addChild( optionsPanel );
    this.addChild( comboBoxListContainer );


    if ( !model.isBasicsVersion ) {
      // we offset the camera, so we don't have an exact constant. this is tuned
      var approximateVisualCenterX = this.layoutBounds.width / 2 - 100;

      // NOTE: these font sizes are scaled!
      var realViewLabel = new Text( controlRealViewString, {
        font: new PhetFont( 28 ),
        fill: MoleculeShapesColorProfile.controlPanelTextProperty
      } );
      var modelViewLabel = new Text( controlModelViewString, {
        font: new PhetFont( 28 ),
        fill: MoleculeShapesColorProfile.controlPanelTextProperty
      } );

      var horizontalSpacing = 30;

      var radioButtonScale = 0.7;
      var realRadioButton = new AquaRadioButton( model.showRealViewProperty, true, realViewLabel, {
        scale: radioButtonScale,
        top: this.layoutBounds.top + 20,
        right: approximateVisualCenterX - horizontalSpacing / 2,
        maxWidth: 320
      } );
      var modelRadioButton = new AquaRadioButton( model.showRealViewProperty, false, modelViewLabel, {
        scale: radioButtonScale,
        top: this.layoutBounds.top + 20,
        left: approximateVisualCenterX + horizontalSpacing / 2,
        maxWidth: 320
      } );
      realRadioButton.touchArea = realRadioButton.mouseArea = realRadioButton.localBounds.dilated( horizontalSpacing / 2 / radioButtonScale );
      modelRadioButton.touchArea = modelRadioButton.mouseArea = modelRadioButton.localBounds.dilated( horizontalSpacing / 2 / radioButtonScale );
      this.addChild( realRadioButton );
      this.addChild( modelRadioButton );
    }

    // rebuild our view when we switch molecules
    model.moleculeProperty.lazyLink( function( newMolecule, oldMolecule ) {
      // tear down the old view
      self.removeMoleculeView( self.moleculeView );
      self.moleculeView.dispose();

      // create the new view
      self.moleculeView = new MoleculeView( model, self, newMolecule );
      self.addMoleculeView( self.moleculeView );
    } );
  }

  moleculeShapes.register( 'RealMoleculesScreenView', RealMoleculesScreenView );

  return inherit( MoleculeShapesScreenView, RealMoleculesScreenView );
} );
