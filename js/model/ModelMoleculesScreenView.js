// Copyright 2014-2020, University of Colorado Boulder

/**
 * View for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../dot/js/Vector3.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Node from '../../../scenery/js/nodes/Node.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import TextPushButton from '../../../sun/js/buttons/TextPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PairGroup from '../common/model/PairGroup.js';
import MoleculeView from '../common/view/3d/MoleculeView.js';
import MoleculeShapesColorProfile from '../common/view/MoleculeShapesColorProfile.js';
import MoleculeShapesPanel from '../common/view/MoleculeShapesPanel.js';
import MoleculeShapesScreenView from '../common/view/MoleculeShapesScreenView.js';
import OptionsNode from '../common/view/OptionsNode.js';
import moleculeShapes from '../moleculeShapes.js';
import moleculeShapesStrings from '../moleculeShapesStrings.js';
import BondGroupNode from './BondGroupNode.js';

const controlBondingString = moleculeShapesStrings.control.bonding;
const controlLonePairString = moleculeShapesStrings.control.lonePair;
const controlOptionsString = moleculeShapesStrings.control.options;
const controlRemoveAllString = moleculeShapesStrings.control.removeAll;

class ModelMoleculesScreenView extends MoleculeShapesScreenView {

  /**
   * Constructor for the ModelMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( model, tandem );

    this.model = model; // @private {MoleculeShapesModel}

    this.moleculeView = new MoleculeView( model, this, model.moleculeProperty.value, tandem.createTandem( 'moleculeView' ) ); // @public
    this.addMoleculeView( this.moleculeView );

    const addPairCallback = this.addPairGroup.bind( this );
    const removePairCallback = this.removePairGroup.bind( this );

    // TODO: improved layout handling

    const optionsPanelTandem = tandem.createTandem( 'optionsPanel' );
    const bondingPanelTandem = tandem.createTandem( 'bondingPanel' );
    const lonePairPanelTandem = tandem.createTandem( 'lonePairPanel' );

    const optionsNode = new OptionsNode( model, optionsPanelTandem );
    const bondingNode = new VBox( {
      children: [
        new BondGroupNode( model, 1, addPairCallback, removePairCallback, bondingPanelTandem.createTandem( 'singleBondNode' ), {} ),
        new BondGroupNode( model, 2, addPairCallback, removePairCallback, bondingPanelTandem.createTandem( 'doubleBondNode' ), {} ),
        new BondGroupNode( model, 3, addPairCallback, removePairCallback, bondingPanelTandem.createTandem( 'tripleBondNode' ), {} )
      ],
      spacing: 10,
      align: 'left'
    } );
    const lonePairNode = new BondGroupNode( model, 0, addPairCallback, removePairCallback, lonePairPanelTandem.createTandem( 'lonePairNode' ), {} );
    const removeAllButton = new TextPushButton( controlRemoveAllString, {
      font: new PhetFont( 16 ),
      textFill: MoleculeShapesColorProfile.removeButtonTextProperty.value,
      maxWidth: 320,
      listener: () => {
        model.moleculeProperty.value.removeAllGroups();
      },
      tandem: tandem.createTandem( 'removeAllButton' )
    } );

    MoleculeShapesColorProfile.removeButtonBackgroundProperty.link( color => {
      removeAllButton.baseColor = color;
    } );
    removeAllButton.touchArea = removeAllButton.localBounds.dilatedXY( 30, 10 );

    function updateButtonEnabled() {
      removeAllButton.enabled = model.moleculeProperty.value.radialGroups.length > 0;
    }

    model.moleculeProperty.value && model.moleculeProperty.value.bondChangedEmitter.addListener( updateButtonEnabled );
    updateButtonEnabled();

    // calculate the maximum width, so we can make sure our panels are the same width by matching xMargins
    const optionsTempNode = new Node( { children: [ optionsNode ] } );
    const bondingTempNode = new Node( { children: [ bondingNode ] } );
    const lonePairTempNode = new Node( { children: [ lonePairNode ] } );
    const maxInternalWidth = Math.max( new MoleculeShapesPanel( controlOptionsString, optionsTempNode, Tandem.OPT_OUT ).width,
      Math.max( new MoleculeShapesPanel( controlBondingString, bondingTempNode, Tandem.OPT_OUT ).width,
        new MoleculeShapesPanel( controlLonePairString, lonePairTempNode, Tandem.OPT_OUT ).width ) );
    optionsTempNode.removeAllChildren();
    bondingTempNode.removeAllChildren();
    lonePairTempNode.removeAllChildren();

    const maxExternalWidth = 350; // How big the panels can get before really interfering
    const bondingPanel = new MoleculeShapesPanel( controlBondingString, bondingNode, bondingPanelTandem, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      xMargin: ( maxInternalWidth - bondingNode.width ) / 2 + 15,
      tandem: bondingPanelTandem
    } );
    let bottom = bondingPanel.bottom;
    if ( !model.isBasicsVersion ) {
      const lonePairPanel = new MoleculeShapesPanel( controlLonePairString, lonePairNode, lonePairPanelTandem, {
        maxWidth: maxExternalWidth,
        right: this.layoutBounds.right - 10,
        top: bondingPanel.bottom + 10,
        xMargin: ( maxInternalWidth - lonePairNode.width ) / 2 + 15,
        tandem: lonePairPanelTandem
      } );
      this.addChild( lonePairPanel );
      bottom = lonePairPanel.bottom;
    }
    removeAllButton.centerX = bondingPanel.centerX;
    removeAllButton.top = bottom + 15;
    const optionsPanel = new MoleculeShapesPanel( controlOptionsString, optionsNode, optionsPanelTandem, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: removeAllButton.bottom + 20,
      xMargin: ( maxInternalWidth - optionsNode.width ) / 2 + 15,
      tandem: optionsPanelTandem
    } );
    this.addChild( bondingPanel );
    this.addChild( removeAllButton );
    this.addChild( optionsPanel );

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

  /**
   * Adds a PairGroup to the model from the Bonding panel position.
   * @public
   *
   * @param {number} bondOrder - The order of the bond (0 through 3)
   * @param {Bounds2} globalBounds - The bounds of the clicked-on overlay for the pair group (e.g. the lone pair in
   *                                 the "Lone Pair" panel), so we can place the inital model position of the pair
   *                                 group near the click position (it will animate from that position).
   */
  addPairGroup( bondOrder, globalBounds ) {
    const screenPoint = globalBounds.leftCenter;
    const threePoint = this.getPlanarMoleculePosition( screenPoint );

    // when adding a pair group in the control panel, it looks better when starting further away
    const extraFactor = 1.2;

    const pair = new PairGroup( new Vector3( 0, 0, 0 ).set( threePoint ).multiplyScalar( extraFactor ), bondOrder === 0 );
    this.model.moleculeProperty.value.addGroupAndBond( pair, this.model.moleculeProperty.value.centralAtom, bondOrder, ( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ) );
  }

  /**
   * Removes a PairGroup from the model.
   * @public
   * @param {number} bondOrder
   */
  removePairGroup( bondOrder ) {
    const molecule = this.model.moleculeProperty.value;

    const bonds = molecule.getBondsAround( molecule.centralAtom );

    for ( let i = bonds.length - 1; i >= 0; i-- ) {
      if ( bonds[ i ].order === bondOrder ) {
        const atom = bonds[ i ].getOtherAtom( molecule.centralAtom );

        molecule.removeGroup( atom );
        break;
      }
    }
  }
}

moleculeShapes.register( 'ModelMoleculesScreenView', ModelMoleculesScreenView );
export default ModelMoleculesScreenView;
