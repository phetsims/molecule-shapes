// Copyright 2014-2019, University of Colorado Boulder

/**
 * View for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const BondGroupNode = require( 'MOLECULE_SHAPES/model/BondGroupNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  const MoleculeShapesColorProfile = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColorProfile' );
  const MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  const MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  const MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );
  const Node = require( 'SCENERY/nodes/Node' );
  const OptionsNode = require( 'MOLECULE_SHAPES/common/view/OptionsNode' );
  const PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const TextPushButton = require( 'SUN/buttons/TextPushButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector3 = require( 'DOT/Vector3' );

  const controlBondingString = require( 'string!MOLECULE_SHAPES/control.bonding' );
  const controlLonePairString = require( 'string!MOLECULE_SHAPES/control.lonePair' );
  const controlOptionsString = require( 'string!MOLECULE_SHAPES/control.options' );
  const controlRemoveAllString = require( 'string!MOLECULE_SHAPES/control.removeAll' );

  /**
   * Constructor for the ModelMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function ModelMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );

    this.model = model; // @private {MoleculeShapesModel}

    this.moleculeView = new MoleculeView( model, this, model.moleculeProperty.get() ); // @public
    this.addMoleculeView( this.moleculeView );

    var addPairCallback = this.addPairGroup.bind( this );
    var removePairCallback = this.removePairGroup.bind( this );

    var optionsNode = new OptionsNode( model );
    var bondingNode = new VBox( {
      children: [
        new BondGroupNode( model, 1, addPairCallback, removePairCallback, {} ),
        new BondGroupNode( model, 2, addPairCallback, removePairCallback, {} ),
        new BondGroupNode( model, 3, addPairCallback, removePairCallback, {} )
      ],
      spacing: 10,
      align: 'left'
    } );
    var lonePairNode = new BondGroupNode( model, 0, addPairCallback, removePairCallback, {} );
    var removeAllButton = new TextPushButton( controlRemoveAllString, {
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

    model.moleculeProperty.get() && model.moleculeProperty.get().on( 'bondChanged', updateButtonEnabled );
    updateButtonEnabled();

    // calculate the maximum width, so we can make sure our panels are the same width by matching xMargins
    var optionsTempNode = new Node( { children: [ optionsNode ] } );
    var bondingTempNode = new Node( { children: [ bondingNode ] } );
    var lonePairTempNode = new Node( { children: [ lonePairNode ] } );
    var maxInternalWidth = Math.max( new MoleculeShapesPanel( controlOptionsString, optionsTempNode ).width,
      Math.max( new MoleculeShapesPanel( controlBondingString, bondingTempNode ).width,
        new MoleculeShapesPanel( controlLonePairString, lonePairTempNode ).width ) );
    optionsTempNode.removeAllChildren();
    bondingTempNode.removeAllChildren();
    lonePairTempNode.removeAllChildren();

    var maxExternalWidth = 350; // How big the panels can get before really interfering
    var bondingPanel = new MoleculeShapesPanel( controlBondingString, bondingNode, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      xMargin: ( maxInternalWidth - bondingNode.width ) / 2 + 15
    } );
    var bottom = bondingPanel.bottom;
    if ( !model.isBasicsVersion ) {
      var lonePairPanel = new MoleculeShapesPanel( controlLonePairString, lonePairNode, {
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
    var optionsPanel = new MoleculeShapesPanel( controlOptionsString, optionsNode, {
      maxWidth: maxExternalWidth,
      right: this.layoutBounds.right - 10,
      top: removeAllButton.bottom + 20,
      xMargin: ( maxInternalWidth - optionsNode.width ) / 2 + 15
    } );
    this.addChild( bondingPanel );
    this.addChild( removeAllButton );
    this.addChild( optionsPanel );
  }

  moleculeShapes.register( 'ModelMoleculesScreenView', ModelMoleculesScreenView );

  return inherit( MoleculeShapesScreenView, ModelMoleculesScreenView, {
    /**
     * Adds a PairGroup to the model from the Bonding panel location.
     * @public
     *
     * @param {number} bondOrder - The order of the bond (0 through 3)
     * @param {Bounds2} globalBounds - The bounds of the clicked-on overlay for the pair group (e.g. the lone pair in
     *                                 the "Lone Pair" panel), so we can place the inital model location of the pair
     *                                 group near the click location (it will animate from that location).
     */
    addPairGroup: function( bondOrder, globalBounds ) {
      var screenPoint = globalBounds.leftCenter;
      var threePoint = this.getPlanarMoleculePosition( screenPoint );

      // when adding a pair group in the location of the control panel, it looks better when starting further away
      var extraFactor = 1.2;

      var pair = new PairGroup( new Vector3( 0, 0, 0 ).set( threePoint ).multiplyScalar( extraFactor ), bondOrder === 0 );
      this.model.moleculeProperty.get().addGroupAndBond( pair, this.model.moleculeProperty.get().centralAtom, bondOrder, ( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ) );
    },

    /**
     * Removes a PairGroup from the model.
     * @public
     * @param {number} bondOrder
     */
    removePairGroup: function( bondOrder ) {
      var molecule = this.model.moleculeProperty.get();

      var bonds = molecule.getBondsAround( molecule.centralAtom );

      for ( var i = bonds.length - 1; i >= 0; i-- ) {
        if ( bonds[ i ].order === bondOrder ) {
          var atom = bonds[ i ].getOtherAtom( molecule.centralAtom );

          molecule.removeGroup( atom );
          break;
        }
      }
    }
  } );
} );
