// Copyright 2014-2019, University of Colorado Boulder

/**
 * View for the 'Real Molecules' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const ChemUtils = require( 'NITROGLYCERIN/ChemUtils' );
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  const MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  const MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );
  const Node = require( 'SCENERY/nodes/Node' );
  const OptionsNode = require( 'MOLECULE_SHAPES/common/view/OptionsNode' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RealMoleculeShape = require( 'MOLECULE_SHAPES/common/model/RealMoleculeShape' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );

  const controlModelViewString = require( 'string!MOLECULE_SHAPES/control.modelView' );
  const controlMoleculeString = require( 'string!MOLECULE_SHAPES/control.molecule' );
  const controlOptionsString = require( 'string!MOLECULE_SHAPES/control.options' );
  const controlRealViewString = require( 'string!MOLECULE_SHAPES/control.realView' );

  /**
   * Constructor for the RealMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function RealMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );
    const self = this;

    this.model = model; // @private {MoleculeShapesModel}
    this.moleculeView = new MoleculeView( model, this, model.moleculeProperty.get() ); // @public
    this.addMoleculeView( this.moleculeView );

    const comboBoxListContainer = new Node();
    const comboBoxMolecules = model.isBasicsVersion ? RealMoleculeShape.TAB_2_BASIC_MOLECULES : RealMoleculeShape.TAB_2_MOLECULES;
    const comboBox = new ComboBox( _.map( comboBoxMolecules, function( realMoleculeShape ) {
      return new ComboBoxItem( new RichText( ChemUtils.toSubscript( realMoleculeShape.displayName ) ), realMoleculeShape );
    } ), model.realMoleculeShapeProperty, comboBoxListContainer, {
      xMargin: 13,
      yMargin: 10,
      cornerRadius: 8
    } );
    const optionsNode = new OptionsNode( model );

    // calculate the maximum width, so we can make sure our panels are the same width by matching xMargins
    const maxWidth = Math.max( optionsNode.width, comboBox.width );
    const maxExternalWidth = 350; // How big the panels can get before really interfering

    const moleculePanel = new MoleculeShapesPanel( controlMoleculeString, comboBox, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      xMargin: ( maxWidth - comboBox.width ) / 2 + 15
    } );
    const optionsPanel = new MoleculeShapesPanel( controlOptionsString, optionsNode, {
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
      const approximateVisualCenterX = this.layoutBounds.width / 2 - 100;

      // NOTE: these font sizes are scaled!
      const realViewLabel = new Text( controlRealViewString, {
        font: new PhetFont( 28 ),
        fill: MoleculeShapesColorProfile.controlPanelTextProperty
      } );
      const modelViewLabel = new Text( controlModelViewString, {
        font: new PhetFont( 28 ),
        fill: MoleculeShapesColorProfile.controlPanelTextProperty
      } );

      const horizontalSpacing = 30;

      const radioButtonScale = 0.7;
      const realRadioButton = new AquaRadioButton( model.showRealViewProperty, true, realViewLabel, {
        radius: 16,
        scale: radioButtonScale,
        top: this.layoutBounds.top + 20,
        right: approximateVisualCenterX - horizontalSpacing / 2,
        maxWidth: 320
      } );
      const modelRadioButton = new AquaRadioButton( model.showRealViewProperty, false, modelViewLabel, {
        radius: 16,
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
