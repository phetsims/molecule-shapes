// Copyright 2014-2021, University of Colorado Boulder

/**
 * View for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../dot/js/Vector3.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import FlowBox from '../../../scenery/js/layout/FlowBox.js';
import AlignBox from '../../../scenery/js/nodes/AlignBox.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import TextPushButton from '../../../sun/js/buttons/TextPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PairGroup from '../common/model/PairGroup.js';
import MoleculeView from '../common/view/3d/MoleculeView.js';
import moleculeShapesColorProfile from '../common/view/moleculeShapesColorProfile.js';
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

    // @private {MoleculeShapesModel}
    this.model = model;

    // @public {MoleculeView}
    this.moleculeView = new MoleculeView( model, this, model.moleculeProperty.value, tandem.createTandem( 'moleculeView' ) );
    this.addMoleculeView( this.moleculeView );

    const addPairCallback = this.addPairGroup.bind( this );
    const removePairCallback = this.removePairGroup.bind( this );

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
      baseColor: moleculeShapesColorProfile.removeButtonBackgroundProperty,
      font: new PhetFont( 16 ),
      textFill: moleculeShapesColorProfile.removeButtonTextProperty.value,
      maxWidth: 320,
      textNodeOptions: {
        tandem: Tandem.OPT_OUT
      },
      layoutOptions: { topMargin: 5 },
      touchAreaXDilation: 30,
      touchAreaYDilation: 10,
      listener: () => {
        model.moleculeProperty.value.removeAllGroups();
      },
      tandem: tandem.createTandem( 'removeAllButton' )
    } );

    function updateButtonEnabled() {
      removeAllButton.enabled = model.moleculeProperty.value.radialGroups.length > 0;
    }

    model.moleculeProperty.link( ( newMolecule, oldMolecule ) => {
      if ( oldMolecule ) {
        oldMolecule.bondChangedEmitter.removeListener( updateButtonEnabled );
      }
      if ( newMolecule ) {
        newMolecule.bondChangedEmitter.addListener( updateButtonEnabled );
      }
      updateButtonEnabled();
    } );

    const rightAlignGroup = new AlignGroup( { matchVertical: false } );
    const createBox = ( node, options ) => rightAlignGroup.createBox( node, merge( {
      maxWidth: 330
    }, options ) );

    const rightBox = new FlowBox( {
      spacing: 10,
      orientation: 'vertical',
      children: [
        new MoleculeShapesPanel( controlBondingString, createBox( bondingNode ), bondingPanelTandem, {
          tandem: bondingPanelTandem
        } ),
        ...( !model.isBasicsVersion ? [ new MoleculeShapesPanel( controlLonePairString, createBox( lonePairNode ), lonePairPanelTandem, {
          tandem: lonePairPanelTandem
        } ) ] : [] ),
        removeAllButton,
        new MoleculeShapesPanel( controlOptionsString, createBox( optionsNode, { xAlign: 'left' } ), optionsPanelTandem, {
          layoutOptions: { topMargin: 10 },
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
