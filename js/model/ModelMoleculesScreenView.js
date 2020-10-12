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
   */
  constructor( model ) {
    super( model );

    this.model = model; // @private {MoleculeShapesModel}

    this.moleculeView = new MoleculeView( model, this, model.moleculeProperty.get() ); // @public
    this.addMoleculeView( this.moleculeView );

    const addPairCallback = this.addPairGroup.bind( this );
    const removePairCallback = this.removePairGroup.bind( this );

    const optionsNode = new OptionsNode( model );
    const bondingNode = new VBox( {
      children: [
        new BondGroupNode( model, 1, addPairCallback, removePairCallback, {} ),
        new BondGroupNode( model, 2, addPairCallback, removePairCallback, {} ),
        new BondGroupNode( model, 3, addPairCallback, removePairCallback, {} )
      ],
      spacing: 10,
      align: 'left'
    } );
    const lonePairNode = new BondGroupNode( model, 0, addPairCallback, removePairCallback, {} );
    const removeAllButton = new TextPushButton( controlRemoveAllString, {
      font: new PhetFont( 16 ),
      textFill: MoleculeShapesColorProfile.removeButtonTextProperty.value,
      maxWidth: 320,
      listener: function() {
        model.moleculeProperty.get().removeAllGroups();
      }
    } );

    MoleculeShapesColorProfile.removeButtonBackgroundProperty.link( function( color ) {
      removeAllButton.baseColor = color;
    } );
    removeAllButton.touchArea = removeAllButton.localBounds.dilatedXY( 30, 10 );

    function updateButtonEnabled() {
      removeAllButton.enabled = model.moleculeProperty.get().radialGroups.length > 0;
    }

    model.moleculeProperty.get() && model.moleculeProperty.get().bondChangedEmitter.addListener( updateButtonEnabled );
    updateButtonEnabled();

    // calculate the maximum width, so we can make sure our panels are the same width by matching xMargins
    const optionsTempNode = new Node( { children: [ optionsNode ] } );
    const bondingTempNode = new Node( { children: [ bondingNode ] } );
    const lonePairTempNode = new Node( { children: [ lonePairNode ] } );
    const maxInternalWidth = Math.max( new MoleculeShapesPanel( controlOptionsString, optionsTempNode ).width,
      Math.max( new MoleculeShapesPanel( controlBondingString, bondingTempNode ).width,
        new MoleculeShapesPanel( controlLonePairString, lonePairTempNode ).width ) );
    optionsTempNode.removeAllChildren();
    bondingTempNode.removeAllChildren();
    lonePairTempNode.removeAllChildren();

    const maxExternalWidth = 350; // How big the panels can get before really interfering
    const bondingPanel = new MoleculeShapesPanel( controlBondingString, bondingNode, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      xMargin: ( maxInternalWidth - bondingNode.width ) / 2 + 15
    } );
    let bottom = bondingPanel.bottom;
    if ( !model.isBasicsVersion ) {
      const lonePairPanel = new MoleculeShapesPanel( controlLonePairString, lonePairNode, {
        maxWidth: maxExternalWidth,
        right: this.layoutBounds.right - 10,
        top: bondingPanel.bottom + 10,
        xMargin: ( maxInternalWidth - lonePairNode.width ) / 2 + 15
      } );
      this.addChild( lonePairPanel );
      bottom = lonePairPanel.bottom;
    }
    removeAllButton.centerX = bondingPanel.centerX;
    removeAllButton.top = bottom + 15;
    const optionsPanel = new MoleculeShapesPanel( controlOptionsString, optionsNode, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: removeAllButton.bottom + 20,
      xMargin: ( maxInternalWidth - optionsNode.width ) / 2 + 15
    } );
    this.addChild( bondingPanel );
    this.addChild( removeAllButton );
    this.addChild( optionsPanel );
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
    this.model.moleculeProperty.get().addGroupAndBond( pair, this.model.moleculeProperty.get().centralAtom, bondOrder, ( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ) );
  }

  /**
   * Removes a PairGroup from the model.
   * @public
   * @param {number} bondOrder
   */
  removePairGroup( bondOrder ) {
    const molecule = this.model.moleculeProperty.get();

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
