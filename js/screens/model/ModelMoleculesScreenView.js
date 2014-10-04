//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/view/MoleculeShapesPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var BondGroupNode = require( 'MOLECULE_SHAPES/screens/model/BondGroupNode' );
  var OptionsNode = require( 'MOLECULE_SHAPES/view/OptionsNode' );
  var MoleculeView = require( 'MOLECULE_SHAPES/view/3d/MoleculeView' );

  var bondingString = require( 'string!MOLECULE_SHAPES/control.bonding' );
  var lonePairString = require( 'string!MOLECULE_SHAPES/control.lonePair' );
  var optionsString = require( 'string!MOLECULE_SHAPES/control.options' );
  var removeAllString = require( 'string!MOLECULE_SHAPES/control.removeAll' );

  /**
   * Constructor for the ModelMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function ModelMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );

    this.model = model;

    this.moleculeView = new MoleculeView( model, model.molecule );
    this.threeScene.add( this.moleculeView );

    var addPairCallback = this.addPairGroup.bind( this );
    var removePairCallback = this.removePairGroup.bind( this );

    var optionsNode = new OptionsNode( model.showLonePairsProperty, model.showBondAnglesProperty, model.isBasicsVersion );
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
    // TODO: how to change the baseColor dynamically!
    var removeAllButton = new TextPushButton( removeAllString, {
      font: new PhetFont( 16 ),
      textFill: MoleculeShapesColors.removeButtonText,
      baseColor: MoleculeShapesColors.removeButtonBackground,
      listener: function() {
        model.molecule.removeAllGroups();
      }
    } );
    removeAllButton.touchArea = removeAllButton.localBounds.dilatedXY( 30, 10 );
    function updateButtonEnabled() {
      removeAllButton.enabled = model.molecule.getRadialAtoms().length > 0;
    }
    model.molecule.on( 'bondChanged', updateButtonEnabled );
    updateButtonEnabled();

    // calculate the maximum width, so we can make sure our panels are the same width by matching xMargins
    var maxWidth = Math.max( optionsNode.width, Math.max( bondingNode.width, lonePairNode.width ) );

    var bondingPanel = new MoleculeShapesPanel( bondingString, bondingNode, {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      xMargin: ( maxWidth - bondingNode.width ) / 2 + 15
    } );
    var bottom = bondingPanel.bottom;
    if ( !model.isBasicsVersion ) {
      var lonePairPanel = new MoleculeShapesPanel( lonePairString, lonePairNode, {
        right: this.layoutBounds.right - 10,
        top: bondingPanel.bottom + 10,
        xMargin: ( maxWidth - lonePairNode.width ) / 2 + 15
      } );
      this.addChild( lonePairPanel );
      bottom = lonePairPanel.bottom;
    }
    removeAllButton.centerX = bondingPanel.centerX;
    removeAllButton.top = bottom + 15;
    var optionsPanel = new MoleculeShapesPanel( optionsString, optionsNode, {
      right: this.layoutBounds.right - 10,
      top: removeAllButton.bottom + 20,
      xMargin: ( maxWidth - optionsNode.width ) / 2 + 15
    } );
    this.addChild( bondingPanel );
    this.addChild( removeAllButton );
    this.addChild( optionsPanel );
  }

  return inherit( MoleculeShapesScreenView, ModelMoleculesScreenView, {
    addPairGroup: function( bondOrder, globalBounds ) {
      var screenPoint = globalBounds.leftCenter;
      var threePoint = this.getPlanarMoleculePosition( screenPoint );

      var extraFactor = 1.2;

      // var pair = new PairGroup( new Vector3( 10, 20, 0 ), bondOrder === 0, false );
      var pair = new PairGroup( new Vector3( threePoint.x * extraFactor, threePoint.y * extraFactor, threePoint.z * extraFactor ), bondOrder === 0, false );
      this.model.molecule.addGroupAndBond( pair, this.model.molecule.getCentralAtom(), bondOrder, ( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ) / PairGroup.REAL_TMP_SCALE );
    },

    removePairGroup: function( bondOrder ) {
      var molecule = this.model.molecule;

      var bonds = molecule.getBonds( molecule.getCentralAtom() );

      for ( var i = bonds.length - 1; i >= 0; i-- ) {
        if ( bonds[i].order === bondOrder ) {
          var atom = bonds[i].getOtherAtom( molecule.getCentralAtom() );

          molecule.removeGroup( atom );
          break;
        }
      }
    }
  } );
} );
