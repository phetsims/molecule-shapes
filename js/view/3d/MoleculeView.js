// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of a Molecule {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var AtomView = require( 'MOLECULE_SHAPES/view/3d/AtomView' );

  function MoleculeView( model, molecule ) {
    var view = this;

    THREE.Object3D.call( this );

    this.model = model;
    this.molecule = molecule;

    this.atomNodes = [];
    this.lonePairNodes = [];
    this.bondNodes = [];
    this.angleNodes = [];
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
      this.centerAtomView = new AtomView( '#fff' );
    }
    this.add( this.centerAtomView );
  }

  return inherit( THREE.Object3D, MoleculeView, {

    intersect: function( ray3 ) {
      // TODO
    },

    addGroup: function( group ) {

    },

    removeGroup: function( group ) {

    },

    addBond: function( bond ) {

    },

    removeBond: function( bond ) {

    }
  } );
} );
