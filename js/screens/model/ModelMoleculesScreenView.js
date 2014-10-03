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
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var MoleculeView = require( 'MOLECULE_SHAPES/view/3d/MoleculeView' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );

  /**
   * Constructor for the ModelMoleculesScreenView
   * @param {ModelMoleculesModel} model the model for the entire screen
   * @constructor
   */
  function ModelMoleculesScreenView( model ) {
    MoleculeShapesScreenView.call( this, model );
    var screenView = this;

    this.model = model;

    this.moleculeView = new MoleculeView( model, model.molecule );
    this.threeScene.add( this.moleculeView );

    // molecule setup
    var molecule = model.molecule;

    /*---------------------------------------------------------------------------*
    * TEMPORARY
    *----------------------------------------------------------------------------*/
    this.addChild( new TextPushButton( 'Add a single bond', {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10,
      listener: function() {
        screenView.addPairGroup( 1 );
      }
    } ) );
    this.addChild( new TextPushButton( 'Remove a single bond', {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 60,
      listener: function() {
        screenView.removePairGroup( 1 );
      }
    } ) );
    this.addChild( new TextPushButton( 'Add a double bond', {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 110,
      listener: function() {
        screenView.addPairGroup( 2 );
      }
    } ) );
    this.addChild( new TextPushButton( 'Remove a double bond', {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 160,
      listener: function() {
        screenView.removePairGroup( 2 );
      }
    } ) );
    this.addChild( new TextPushButton( 'Add a lone pair', {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 210,
      listener: function() {
        screenView.addPairGroup( 0 );
      }
    } ) );
    this.addChild( new TextPushButton( 'Remove a lone pair', {
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 260,
      listener: function() {
        screenView.removePairGroup( 0 );
      }
    } ) );
  }

  return inherit( MoleculeShapesScreenView, ModelMoleculesScreenView, {
    addPairGroup: function( bondOrder ) {
      var pair = new PairGroup( new Vector3( 10, 20, 0 ), bondOrder === 0, false );
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
