// Copyright 2014-2022, University of Colorado Boulder

/**
 * View for the 'Real Molecules' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ChemUtils from '../../../nitroglycerin/js/ChemUtils.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { FlowBox } from '../../../scenery/js/imports.js';
import { AlignBox } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { RichText } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../sun/js/AquaRadioButtonGroup.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../sun/js/ComboBoxItem.js';
import RealMoleculeShape from '../common/model/RealMoleculeShape.js';
import MoleculeView from '../common/view/3d/MoleculeView.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import MoleculeShapesPanel from '../common/view/MoleculeShapesPanel.js';
import MoleculeShapesScreenView from '../common/view/MoleculeShapesScreenView.js';
import OptionsNode from '../common/view/OptionsNode.js';
import moleculeShapes from '../moleculeShapes.js';
import moleculeShapesStrings from '../moleculeShapesStrings.js';

const controlModelViewString = moleculeShapesStrings.control.modelView;
const controlMoleculeString = moleculeShapesStrings.control.molecule;
const controlOptionsString = moleculeShapesStrings.control.options;
const controlRealViewString = moleculeShapesStrings.control.realView;

class RealMoleculesScreenView extends MoleculeShapesScreenView {
  /**
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( model, tandem );

    this.model = model; // @private {MoleculeShapesModel}
    this.moleculeView = new MoleculeView( model, this, model.moleculeProperty.value, tandem.createTandem( 'moleculeView' ) ); // @public
    this.addMoleculeView( this.moleculeView );

    const moleculePanelTandem = tandem.createTandem( 'moleculePanel' );
    const optionsPanelTandem = tandem.createTandem( 'optionsPanel' );

    const comboBoxListContainer = new Node();
    const comboBoxMolecules = model.isBasicsVersion ? RealMoleculeShape.TAB_2_BASIC_MOLECULES : RealMoleculeShape.TAB_2_MOLECULES;
    const comboBoxItems = _.map( comboBoxMolecules, realMoleculeShape => {
      return new ComboBoxItem( new RichText( ChemUtils.toSubscript( realMoleculeShape.displayName ) ), realMoleculeShape, {
        tandemName: `${realMoleculeShape.displayName}Item`
      } );
    } );
    const moleculeComboBox = new ComboBox( model.realMoleculeShapeProperty, comboBoxItems, comboBoxListContainer, {
      xMargin: 13,
      yMargin: 10,
      cornerRadius: 8,
      tandem: moleculePanelTandem.createTandem( 'moleculeComboBox' )
    } );
    const optionsNode = new OptionsNode( model, optionsPanelTandem );

    const rightBox = new FlowBox( {
      spacing: 15,
      orientation: 'vertical',
      stretch: true,
      children: [
        new MoleculeShapesPanel( controlMoleculeString, moleculeComboBox, moleculePanelTandem, {
          tandem: moleculePanelTandem,
          align: 'center'
        } ),
        new MoleculeShapesPanel( controlOptionsString, optionsNode, optionsPanelTandem, {
          tandem: optionsPanelTandem
        } )
      ]
    } );
    this.addChild( new AlignBox( rightBox, {
      alignBounds: this.layoutBounds,
      xAlign: 'right',
      yAlign: 'top',
      margin: 10
    } ) );

    this.addChild( comboBoxListContainer );

    if ( !model.isBasicsVersion ) {
      // we offset the camera, so we don't have an exact constant. this is tuned
      const approximateVisualCenterX = this.layoutBounds.width / 2 - 100;

      // NOTE: these font sizes are scaled!
      const realViewLabel = new Text( controlRealViewString, {
        font: new PhetFont( 28 ),
        fill: MoleculeShapesColors.controlPanelTextProperty
      } );
      const modelViewLabel = new Text( controlModelViewString, {
        font: new PhetFont( 28 ),
        fill: MoleculeShapesColors.controlPanelTextProperty
      } );

      const horizontalSpacing = 30;

      const radioButtonScale = 0.7;

      const realModelRadioButtonGroup = new AquaRadioButtonGroup( model.showRealViewProperty, [
        {
          node: realViewLabel,
          value: true,
          tandemName: 'realRadioButton'
        },
        {
          node: modelViewLabel,
          value: false,
          tandemName: 'modelRadioButton'
        }
      ], {
        radioButtonOptions: {
          radius: 16,
          scale: radioButtonScale,
          maxWidth: 320
        },
        top: this.layoutBounds.top + 20,
        tandem: tandem.createTandem( 'realModelRadioButtonGroup' ),
        touchAreaYDilation: 10,
        spacing: horizontalSpacing,
        centerX: approximateVisualCenterX,
        orientation: 'horizontal'
      } );
      this.addChild( realModelRadioButtonGroup );
    }

    // rebuild our view when we switch molecules
    model.moleculeProperty.lazyLink( ( newMolecule, oldMolecule ) => {
      // tear down the old view
      this.removeMoleculeView( this.moleculeView );
      this.moleculeView.dispose();

      // create the new view
      this.moleculeView = new MoleculeView( model, this, newMolecule, tandem.createTandem( 'moleculeView' ) );
      this.addMoleculeView( this.moleculeView );
    } );
  }
}

moleculeShapes.register( 'RealMoleculesScreenView', RealMoleculesScreenView );
export default RealMoleculesScreenView;