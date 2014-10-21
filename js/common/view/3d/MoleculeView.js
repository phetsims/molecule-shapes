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
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var AtomView = require( 'MOLECULE_SHAPES/common/view/3d/AtomView' );
  var BondView = require( 'MOLECULE_SHAPES/common/view/3d/BondView' );
  var LonePairView = require( 'MOLECULE_SHAPES/common/view/3d/LonePairView' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesScreenView' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/MoleculeShapesGlobals' );
  var BondAngleWebGLView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleWebGLView' );
  var BondAngleFallbackView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleFallbackView' );

  /*
   * @constructor
   * @param {MoleculeShapesModel} model
   * @param {MoleculeShapesScreenView} screenView
   * @param {Molecule} molecule
   */
  function MoleculeView( model, screenView, molecule ) {
    THREE.Object3D.call( this );

    this.model = model;
    this.screenView = screenView;
    this.renderer = screenView.threeRenderer; // {THREE.Renderer}
    this.molecule = molecule;

    this.atomViews = []; // {AtomView[]}
    this.lonePairViews = []; // {LonePairView[]}
    this.bondViews = []; // {BondView[]}
    this.angleViews = []; // {BondAngleWebGLView[] | BondAngleFallbackView[]}

    this.radialViews = []; // all views that we would want to drag

    this.lastMidpoint = null; // track the last bond-angle midpoint for a 2-atom system globally

    molecule.on( 'groupAdded', this.addGroup.bind( this ) );
    molecule.on( 'groupRemoved', this.removeGroup.bind( this ) );
    molecule.on( 'bondAdded', this.addBond.bind( this ) );
    molecule.on( 'bondRemoved', this.removeBond.bind( this ) );

    // initial setup
    _.each( molecule.radialGroups, this.addGroup.bind( this ) );
    _.each( molecule.getDistantLonePairs(), this.addGroup.bind( this ) );
    _.each( molecule.getBondsAround( molecule.centralAtom ), this.addBond.bind( this ) );

    // the center atom is special
    if ( molecule.isReal ) {
      this.centerAtomView = new AtomView( molecule.centralAtom, this.renderer, AtomView.getElementLocalMaterial( molecule.centralAtom.element ) );
    } else {
      this.centerAtomView = new AtomView( molecule.centralAtom, this.renderer, AtomView.centralAtomLocalMaterial );
    }
    this.add( this.centerAtomView );
  }

  return inherit( THREE.Object3D, MoleculeView, {

    updateView: function() {
      // angle and bond views need to know information about the camera's position
      var cameraPosition = new THREE.Vector3().copy( MoleculeShapesScreenView.cameraPosition ); // this SETS cameraPosition
      this.worldToLocal( cameraPosition ); // this mutates cameraPosition
      var localCameraOrientation = new Vector3().set( cameraPosition ).normalized();

      for ( var i = 0; i < this.bondViews.length; i++ ) {
        this.bondViews[i].updateView( cameraPosition );
      }
      this.updateAngles( localCameraOrientation );
    },

    updateAngles: function( localCameraOrientation ) {
      // we need to handle the 2-atom case separately for proper support of 180-degree bonds
      var hasTwoBonds = this.molecule.radialAtoms.length === 2;
      if ( !hasTwoBonds ) {
        // if we don't have two bonds, just ignore the last midpoint
        this.lastMidpoint = null;
      }

      for ( var i = 0; i < this.angleViews.length; i++ ) {
        var angleView = this.angleViews[i];
        angleView.updateView( this.lastMidpoint, localCameraOrientation );

        // if we have two bonds, store the last midpoint so we can keep the bond midpoint stable
        if ( hasTwoBonds ) {
          this.lastMidpoint = angleView.midpoint.normalized();
        }
      }
    },

    dispose: function() {
      var i;
      for ( i = 0; i < this.atomViews.length; i++ ) {
        this.atomViews[i].dispose();
      }
      for ( i = 0; i < this.bondViews.length; i++ ) {
        this.bondViews[i].dispose();
      }
      for ( i = 0; i < this.angleViews.length; i++ ) {
        this.screenView.returnLabel( this.angleViews[i].label );
        this.angleViews[i].dispose();
      }
      for ( i = 0; i < this.lonePairViews.length; i++ ) {
        this.lonePairViews[i].dispose();
      }
      this.centerAtomView.dispose();
    },

    addGroup: function( group ) {
      // ignore the central atom, we add it in the constructor by default
      if ( group === this.molecule.centralAtom ) {
        return;
      }

      var parentAtom = this.molecule.getParent( group );
      var centralAtom = this.molecule.centralAtom;
      var view;
      if ( group.isLonePair ) {
        view = new LonePairView( group, this.renderer );
        this.lonePairViews.push( view );

        var visibilityProperty = parentAtom === centralAtom ?
                                 this.model.showLonePairsProperty :
                                 MoleculeShapesGlobals.showOuterLonePairsProperty;
        visibilityProperty.linkAttribute( view, 'visible' );

        group.link( 'position', function( position ) {
          var offsetFromParentAtom = position.minus( parentAtom.position );
          var orientation = offsetFromParentAtom.normalized();

          var translation;
          if ( offsetFromParentAtom.magnitude() > PairGroup.LONE_PAIR_DISTANCE ) {
            translation = position.minus( orientation.times( PairGroup.LONE_PAIR_DISTANCE ) );
          }
          else {
            translation = parentAtom.position;
          }

          view.position.set( translation.x, translation.y, translation.z );
          view.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), // rotate from Y_UNIT to the desired orientation
                                                      new THREE.Vector3( orientation.x, orientation.y, orientation.z ) );
        } );
      } else {
        view = new AtomView( group, this.renderer, group.element ?
                                                   AtomView.getElementLocalMaterial( group.element ) :
                                                   AtomView.atomLocalMaterial );
        this.atomViews.push( view );

        group.link( 'position', function( position ) {
          view.position.set( position.x, position.y, position.z );
        } );

        for ( var i = 0; i < this.atomViews.length; i++ ) {
          var otherView = this.atomViews[i];
          if ( otherView !== view ) {
            var bondAngleView = MoleculeShapesGlobals.useWebGL ?
                                new BondAngleWebGLView( this.screenView, this.renderer, this.model.showBondAnglesProperty, this.molecule, otherView.group, view.group, this.screenView.checkOutLabel() ) :
                                new BondAngleFallbackView( this.screenView, this.model.showBondAnglesProperty, this.molecule, otherView.group, view.group, this.screenView.checkOutLabel() );
            this.add( bondAngleView );
            this.angleViews.push( bondAngleView );
          }
        }
      }

      this.add( view );
      if ( parentAtom === centralAtom ) {
        this.radialViews.push( view );
      }
    },

    removeGroup: function( group ) {
      var i;
      if ( group.isLonePair ) {
        // remove the lone pair view itself
        for ( i = 0; i < this.lonePairViews.length; i++ ) {
          var lonePairView = this.lonePairViews[i];
          if ( lonePairView.group === group ) {
            this.remove( lonePairView );
            lonePairView.dispose();
            this.lonePairViews.splice( i, 1 );
            break;
          }
        }
      } else {
        // remove the atom view itself
        for ( i = 0; i < this.atomViews.length; i++ ) {
          var atomView = this.atomViews[i];
          if ( atomView.group === group ) {
            this.remove( atomView );
            atomView.dispose();
            this.atomViews.splice( i, 1 );
            break;
          }
        }

        // remove any bond angles involved, reversed for ease of removal (we may need to remove multiple ones)
        for ( i = this.angleViews.length - 1; i >= 0; i-- ) {
          var bondAngleView = this.angleViews[i];

          if ( bondAngleView.aGroup === group || bondAngleView.bGroup === group ) {
            this.remove( bondAngleView );
            this.screenView.returnLabel( bondAngleView.label );
            bondAngleView.dispose();
            this.angleViews.splice( i, 1 );
          }
        }
      }
      // remove from radialViews (aggregate) if it is included
      for ( i = 0; i < this.radialViews.length; i++ ) {
        if ( this.radialViews[i].group === group ) {
          this.radialViews.splice( i, 1 );
          break;
        }
      }
    },

    addBond: function( bond ) {
      assert && assert( bond.contains( this.molecule.centralAtom ) );
      var group = bond.getOtherAtom( this.molecule.centralAtom );

      if ( !group.isLonePair ) {
        var bondView = new BondView(
          this.renderer,
          bond,
          this.molecule.centralAtom.positionProperty, // center position
          group.positionProperty,
          0.5,
          this.molecule.getMaximumBondLength() );
        this.add( bondView );
        this.bondViews.push( bondView );
      }
    },

    removeBond: function( bond ) {
      for ( var i = this.bondViews.length - 1; i >= 0; i-- ) {
        var bondView = this.bondViews[i];
        if ( bondView.bond === bond ) {
          this.remove( bondView );
          this.bondViews.splice( i, 1 );
          bondView.dispose();
        }
      }
    }
  } );
} );