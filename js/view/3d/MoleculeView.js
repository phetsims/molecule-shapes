// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of a Molecule {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Property = require( 'AXON/Property' );
  var AtomView = require( 'MOLECULE_SHAPES/view/3d/AtomView' );
  var BondView = require( 'MOLECULE_SHAPES/view/3d/BondView' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );

  function MoleculeView( model, molecule ) {
    THREE.Object3D.call( this );

    this.model = model;
    this.molecule = molecule;

    this.atomViews = [];
    this.lonePairViews = [];
    this.bondViews = [];
    this.angleViews = [];
    this.angleReadouts = [];

    molecule.on( 'groupAdded', this.addGroup.bind( this ) );
    molecule.on( 'groupRemoved', this.removeGroup.bind( this ) );
    molecule.on( 'bondAdded', this.addBond.bind( this ) );
    molecule.on( 'bondRemoved', this.removeBond.bind( this ) );

    _.each( molecule.getRadialGroups(), this.addGroup.bind( this ) );
    _.each( molecule.getDistantLonePairs(), this.addGroup.bind( this ) );

    if ( molecule.isReal ) {
      this.centerAtomView = new AtomView( molecule.getCentralAtom().element.color );
    } else {
      this.centerAtomView = new AtomView( MoleculeShapesColors.centralAtom );
    }
    this.add( this.centerAtomView );

    this.scale.set( 0.022, 0.022, 0.022 );
  }

  return inherit( THREE.Object3D, MoleculeView, {

    updateView: function() {
      for ( var i = 0; i < this.bondViews.length; i++ ) {
        this.bondViews[i].updateView();
      }
    },

    intersect: function( ray3 ) {
      // TODO
    },

    addGroup: function( group ) {
      // ignore the central atom, we add it in the constructor by default
      if ( group === this.molecule.getCentralAtom() ) {
        return;
      }

      if ( group.isLonePair ) {
        // TODO
      } else {
        var atomView = new AtomView( group.element ? group.element.color : MoleculeShapesColors.atom );
        atomView.group = group; // TODO: get rid of duck typing
        this.atomViews.push( atomView );
        this.add( atomView );

        group.link( 'position', function( position ) {
          atomView.position.set( position.x, position.y, position.z );
        } );

        // TODO: rebuild bonds/angles?
        this.rebuildBonds();

        // TODO: add in bond angle nodes for every other atom
      }
    },

    removeGroup: function( group ) {
      if ( group.isLonePair ) {
        // TODO
      } else {
        for ( var i = 0; i < this.atomViews.length; i++ ) {
          if ( this.atomViews[i].group === group ) {
            this.remove( this.atomViews[i] );
            this.atomViews.splice( i, 1 );
          }
        }

        // TODO: remove all angle nodes
      }
    },

    addBond: function( bond ) {
      this.rebuildBonds();
    },

    removeBond: function( bond ) {
      this.rebuildBonds();
    },

    rebuildBonds: function() {
      var view = this;
      var molecule = this.molecule;

      // basically remove all of the bonds and rebuild them
      _.each( this.bondViews, function( bondView ) {
        view.remove( bondView );
      } );
      this.bondViews.length = 0;

      _.each( molecule.getRadialAtoms(), function( atom ) {
        var bondView = new BondView(
          new Property( new Vector3() ), // center position
          atom.positionProperty,
          molecule.getParentBond( atom ).order,
          0.5,
          molecule.getMaximumBondLength(),
          '#fff',
          '#fff' );
        view.add( bondView );
        view.bondViews.push( bondView );
      } );
    }
  } );
} );
