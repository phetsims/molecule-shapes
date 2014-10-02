// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of a Molecule {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var AtomView = require( 'MOLECULE_SHAPES/view/3d/AtomView' );

  function MoleculeView( model, molecule ) {
    var view = this;

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
      this.centerAtomView = new AtomView( new Color( 159, 102, 218 ) ); // TODO: abstract away color
    }
    this.add( this.centerAtomView );

    this.scale.set( 0.03, 0.03, 0.03 );
  }

  return inherit( THREE.Object3D, MoleculeView, {

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
        var atomView = new AtomView( group.element ? group.element.color : '#fff' );
        this.atomViews.push( atomView );
        this.add( atomView );

        group.link( 'position', function( position ) {
          atomView.position.set( position.x, position.y, position.z );
        } );

        // TODO: rebuild bonds/angles?

        // TODO: add in bond angle nodes for every other atom
      }
    },

    removeGroup: function( group ) {

    },

    addBond: function( bond ) {

    },

    removeBond: function( bond ) {

    }
  } );
} );
