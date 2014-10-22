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
  var Vector3 = require( 'DOT/Vector3' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var ComboBox = require( 'SUN/ComboBox' );
  var ChemUtils = require( 'NITROGLYCERIN/ChemUtils' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' );
  var VSEPRConfiguration = require( 'MOLECULE_SHAPES/common/model/VSEPRConfiguration' );
  var RealMoleculeShape = require( 'MOLECULE_SHAPES/common/model/RealMoleculeShape' );
  var RealMolecule = require( 'MOLECULE_SHAPES/common/model/RealMolecule' );
  var AttractorModel = require( 'MOLECULE_SHAPES/common/model/AttractorModel' );
  var LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeShapesPanel = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesPanel' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var OptionsNode = require( 'MOLECULE_SHAPES/common/view/OptionsNode' );
  var MoleculeView = require( 'MOLECULE_SHAPES/common/view/3d/MoleculeView' );

  var moleculeString = require( 'string!MOLECULE_SHAPES/control.molecule' );
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
    var screenView = this;

    this.model = model;
    this.moleculeView = new MoleculeView( model, this, model.molecule );
    this.addMoleculeView( this.moleculeView );

    var comboBoxListContainer = new Node();
    var comboBoxMolecules = model.isBasicsVersion ? RealMoleculeShape.TAB_2_BASIC_MOLECULES : RealMoleculeShape.TAB_2_MOLECULES;
    var comboBox = new ComboBox( _.map( comboBoxMolecules,  function( realMoleculeShape ) {
      return {
        value: realMoleculeShape,
        node: new SubSupText( ChemUtils.toSubscript( realMoleculeShape.displayName ), {
          // TODO: font?
        } )
      };
    } ), model.realMoleculeShapeProperty, comboBoxListContainer, {

    } );
    var optionsNode = new OptionsNode( model );

    // calculate the maximum width, so we can make sure our panels are the same width by matching xMargins
    var maxWidth = Math.max( optionsNode.width, comboBox.width );

    var moleculePanel = new MoleculeShapesPanel( moleculeString, comboBox, {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      xMargin: ( maxWidth - comboBox.width ) / 2 + 15
    } );
    var optionsPanel = new MoleculeShapesPanel( optionsString, optionsNode, {
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
      var realViewLabel = new Text( realViewString, { font: new PhetFont( 28 ) } );
      var modelViewLabel = new Text( modelViewString, { font: new PhetFont( 28 ) } );
      MoleculeShapesColors.linkAttribute( 'controlPanelText', realViewLabel, 'fill' );
      MoleculeShapesColors.linkAttribute( 'controlPanelText', modelViewLabel, 'fill' );

      var horizontalSpacing = 30;

      var radioButtonScale = 0.7;
      var realRadioButton = new AquaRadioButton( model.showRealViewProperty, true, realViewLabel, {
        scale: radioButtonScale,
        top: this.layoutBounds.top + 20,
        right: approximateVisualCenterX - horizontalSpacing / 2
      } );
      var modelRadioButton = new AquaRadioButton( model.showRealViewProperty, false, modelViewLabel, {
        scale: radioButtonScale,
        top: this.layoutBounds.top + 20,
        left: approximateVisualCenterX + horizontalSpacing / 2
      } );
      realRadioButton.touchArea = realRadioButton.mouseArea = realRadioButton.localBounds.dilated( horizontalSpacing / 2 / radioButtonScale );
      modelRadioButton.touchArea = modelRadioButton.mouseArea = modelRadioButton.localBounds.dilated( horizontalSpacing / 2 / radioButtonScale );
      this.addChild( realRadioButton );
      this.addChild( modelRadioButton );
    }

    model.showRealViewProperty.lazyLink( function() {
      screenView.rebuildMolecule( false );
    } );

    model.realMoleculeShapeProperty.lazyLink( function() {
      screenView.rebuildMolecule( true );
    } );
  }

  return inherit( MoleculeShapesScreenView, RealMoleculesScreenView, {
    // TODO: consider moving this to the model?
    rebuildMolecule: function( switchedRealMolecule ) {
      var model = this.model;

      // tear down the view
      this.removeMoleculeView( this.moleculeView );
      this.moleculeView.dispose();

      var molecule = this.model.molecule;

      var numRadialAtoms = model.realMoleculeShape.centralAtomCount;
      var numRadialLonePairs = model.realMoleculeShape.centralAtom.lonePairCount;
      var vseprConfiguration = VSEPRConfiguration.getConfiguration( numRadialAtoms, numRadialLonePairs );

      // get a copy of what might be the "old" molecule into whose space we need to rotate into
      var mappingMolecule;
      if ( switchedRealMolecule ) {
        // rebuild from scratch
        mappingMolecule = new RealMolecule( model.realMoleculeShape );
      }
      else {
        // base the rotation on our original
        mappingMolecule = molecule;
      }

      var newMolecule;
      var mapping;
      if ( model.showRealView ) {
        newMolecule = new RealMolecule( model.realMoleculeShape );
        if ( !switchedRealMolecule ) {
          // NOTE: this might miss a couple improper mappings?

          // compute the mapping from our "ideal" to our "old" molecule
          // TODO: something in this mapping seems backwards... but it's working?
          var groups = new RealMolecule( model.realMoleculeShape ).radialGroups;
          mapping = AttractorModel.findClosestMatchingConfiguration(
            AttractorModel.getOrientationsFromOrigin( mappingMolecule.radialGroups ),
            _.map( LocalShape.sortedLonePairsFirst( groups ), function( pair ) {
              return pair.orientation;
            } ),
            LocalShape.vseprPermutations( mappingMolecule.radialGroups ) );
          _.each( newMolecule.getGroups(), function( group ) {
            if ( group !== newMolecule.centralAtom ) {
              group.position = mapping.rotateVector( group.position );
            }
          } );
        }

      }
      else {
        mapping = vseprConfiguration.getIdealGroupRotationToPositions( LocalShape.sortedLonePairsFirst( mappingMolecule.radialGroups ) );
        var permutation = mapping.permutation.inverted();
        var idealUnitVectors = vseprConfiguration.allOrientations;

        newMolecule = new VSEPRMolecule();

        var newCentralAtom = new PairGroup( new Vector3(), false );
        newMolecule.addCentralAtom( newCentralAtom );
        for ( var i = 0; i < numRadialAtoms + numRadialLonePairs; i++ ) {
          var unitVector = mapping.rotateVector( idealUnitVectors[i] );
          if ( i < numRadialLonePairs ) {
            newMolecule.addGroupAndBond( new PairGroup( unitVector.times( PairGroup.LONE_PAIR_DISTANCE ), true ), newCentralAtom, 0 );
          }
          else {
            // we need to dig the bond order out of the mapping molecule, and we need to pick the right one (thus the permutation being applied, at an offset)
            // TODO: verify that this ordering is correct (in radialAtoms)
            var oldRadialGroup = mappingMolecule.radialAtoms[permutation.apply( i ) - numRadialLonePairs];
            var bond = mappingMolecule.getParentBond( oldRadialGroup );
            var group = new PairGroup( unitVector.times( bond.length ), false );
            newMolecule.addGroupAndBond( group, newCentralAtom, bond.order, bond.length );

            newMolecule.addTerminalLonePairs( group, _.filter( mappingMolecule.getNeighbors( oldRadialGroup ), function( group ) { return group.isLonePair; } ).length );
          }
        }
      }
      model.molecule = newMolecule;

      // recreate the view
      this.moleculeView = new MoleculeView( this.model, this, this.model.molecule );
      this.addMoleculeView( this.moleculeView );
    }
  } );
} );
