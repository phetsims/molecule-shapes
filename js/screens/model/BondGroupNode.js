//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Displays a thumbnail of the bond type (single, double, triple) or lone pair, along with a red 'X' for removal.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );
  var RemovePairGroupButton = require( 'MOLECULE_SHAPES/screens/model/RemovePairGroupButton' );

  function createOverlay( listener, options ) {
    var overlay = new Rectangle( 0, 0, 120, 40, 0, 0, _.extend( { fill: 'white', cursor: 'pointer' }, options ) );
    overlay.addInputListener( new ButtonListener( {
      fire: listener
    } ) );
    return overlay;
  }

  function BondGroupNode( model, bondOrder, options ) {
    var self = this;

    this.model = model;
    this.bondOrder = bondOrder;

    var addEnabled = true;
    var overlay = createOverlay( function() {
      if ( addEnabled ) {
        self.addPairGroup();
      }
    } );
    var removeButton = new RemovePairGroupButton( {
      listener: this.removePairGroup.bind( this )
    } );
    removeButton.touchArea = removeButton.localBounds.dilatedY( 14 ).withMinX( removeButton.localBounds.minX - 10 ).withMaxX( removeButton.localBounds.maxX + 20 );
    function update() {
      addEnabled = model.molecule.wouldAllowBondOrder( bondOrder );
      // TODO: change the fill's opacity, not the actual node's opacity!
      overlay.opacity = addEnabled ? 0.1 : 0.5;
      removeButton.visible = _.filter( model.molecule.getBonds( model.molecule.getCentralAtom() ), function( bond ) {
        return bond.order === bondOrder;
      } ).length > 0;
    }
    model.molecule.on( 'bondChanged', update );
    update();

    HBox.call( this, _.extend( {
      children: [overlay, removeButton],
      spacing: 10,
      align: 'center'
    }, options ) );
  }

  return inherit( HBox, BondGroupNode, {
    addPairGroup: function() {
      var pair = new PairGroup( new Vector3( 10, 20, 0 ), this.bondOrder === 0, false );
      this.model.molecule.addGroupAndBond( pair, this.model.molecule.getCentralAtom(), this.bondOrder, ( this.bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ) / PairGroup.REAL_TMP_SCALE );
    },

    removePairGroup: function() {
      var molecule = this.model.molecule;

      var bonds = molecule.getBonds( molecule.getCentralAtom() );

      for ( var i = bonds.length - 1; i >= 0; i-- ) {
        if ( bonds[i].order === this.bondOrder ) {
          var atom = bonds[i].getOtherAtom( molecule.getCentralAtom() );

          molecule.removeGroup( atom );
          break;
        }
      }
    }
  } );
} );

