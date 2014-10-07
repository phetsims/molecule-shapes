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
  var Util = require( 'DOT/Util' );
  var Property = require( 'AXON/Property' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );
  var AtomView = require( 'MOLECULE_SHAPES/view/3d/AtomView' );
  var BondView = require( 'MOLECULE_SHAPES/view/3d/BondView' );
  var LonePairView = require( 'MOLECULE_SHAPES/view/3d/LonePairView' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var BondAngleView = require( 'MOLECULE_SHAPES/view/3d/BondAngleView' );

  var angleDegreesString = require( 'string!MOLECULE_SHAPES/angle.degrees' );

  // @param {MoleculeShapesScreenView} view
  function MoleculeView( model, view, molecule, labelManager ) {
    THREE.Object3D.call( this );

    assert && assert( labelManager );

    this.model = model;
    this.view = view;
    this.molecule = molecule;
    this.labelManager = labelManager;

    this.atomViews = [];
    this.lonePairViews = [];
    this.bondViews = [];
    this.angleViews = [];

    this.radialViews = []; // all views that we would want to drag

    this.lastMidpoint = null;

    molecule.on( 'groupAdded', this.addGroup.bind( this ) );
    molecule.on( 'groupRemoved', this.removeGroup.bind( this ) );
    molecule.on( 'bondAdded', this.addBond.bind( this ) );
    molecule.on( 'bondRemoved', this.removeBond.bind( this ) );

    _.each( molecule.getRadialGroups(), this.addGroup.bind( this ) );
    _.each( molecule.getDistantLonePairs(), this.addGroup.bind( this ) );

    if ( molecule.isReal ) {
      this.centerAtomView = new AtomView( molecule.getCentralAtom().element.color );
    } else {
      this.centerAtomView = new AtomView( MoleculeShapesColors.centralAtomProperty );
    }
    this.add( this.centerAtomView );

    this.scale.set( MoleculeView.scale, MoleculeView.scale, MoleculeView.scale );
  }

  MoleculeView.scale = 0.020;

  return inherit( THREE.Object3D, MoleculeView, {

    updateView: function() {
      for ( var i = 0; i < this.bondViews.length; i++ ) {
        this.bondViews[i].updateView();
      }
      this.updateAngles();
    },

    updateAngles: function() {
      var i;

      // we need to handle the 2-atom case separately for proper support of 180-degree bonds
      var hasTwoBonds = this.molecule.getRadialAtoms().length === 2;
      if ( !hasTwoBonds ) {
        // if we don't have two bonds, just ignore the last midpoint
        this.lastMidpoint = null;
      }

      for ( i = 0; i < this.angleViews.length; i++ ) {
        var angleView = this.angleViews[i];
        angleView.updateView( this.lastMidpoint );

        // if we have two bonds, store the last midpoint so we can keep the bond midpoint stable
        if ( hasTwoBonds ) {
          this.lastMidpoint = angleView.midpoint.normalized();
        }
      }

      if ( this.model.showBondAngles ) {
        // TODO: we're doing this too much, refactor into one place in MoleculeView!
        var cameraPosition = new THREE.Vector3().copy( MoleculeShapesScreenView.cameraPosition ); // this SETS cameraPosition
        this.worldToLocal( cameraPosition ); // this mutates cameraPosition

        var localCameraPosition = new Vector3( cameraPosition.x, cameraPosition.y, cameraPosition.z ).normalized();

        for ( i = 0; i < this.angleViews.length; i++ ) {
          var bondAngleView = this.angleViews[i];

          var a = bondAngleView.aGroup;
          var b = bondAngleView.bGroup;

          var aDir = a.position.normalized();
          var bDir = b.position.normalized();

          var brightness = BondAngleView.calculateBrightness( aDir, bDir, localCameraPosition, this.molecule.getRadialAtoms().length );
          if ( brightness === 0 ) {
            continue;
          }

          // TODO: cleanup

          var centerPoint = new THREE.Vector3(); // e.g. zero
          var midPoint = new THREE.Vector3( bondAngleView.midpoint.x, bondAngleView.midpoint.y, bondAngleView.midpoint.z );

          this.localToWorld( centerPoint );
          this.localToWorld( midPoint );

          this.view.convertScreenPointFromGlobalPoint( centerPoint );
          this.view.convertScreenPointFromGlobalPoint( midPoint );

          var angle = aDir.angleBetween( bDir ) * 180 / Math.PI;

          this.labelManager.showLabel( StringUtils.format( angleDegreesString, Util.toFixed( angle, 1 ) ), brightness, centerPoint, midPoint );
        }
      }

      this.labelManager.finishedAddingLabels();
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
        this.angleViews[i].dispose();
      }
      for ( i = 0; i < this.lonePairViews.length; i++ ) {
        this.lonePairViews[i].dispose();
      }
      this.centerAtomView.dispose();
      // TODO? See what three.js needs, but also release listeners
    },

    intersect: function( ray3 ) {
      // TODO
    },

    addGroup: function( group ) {
      // ignore the central atom, we add it in the constructor by default
      if ( group === this.molecule.getCentralAtom() ) {
        return;
      }

      var parentAtom = this.molecule.getParent( group );
      var centralAtom = this.molecule.getCentralAtom();
      if ( group.isLonePair ) {

        var lonePairView = new LonePairView();
        lonePairView.group = group; // TODO: get rid of duck typing
        this.lonePairViews.push( lonePairView );
        this.add( lonePairView );

        // TODO: remove code duplication
        if ( parentAtom === centralAtom ) {
          this.radialViews.push( lonePairView );
        }

        var visibilityProperty = parentAtom === centralAtom ?
                                 this.model.showLonePairsProperty :
                                 this.model.showAllLonePairsProperty;
        visibilityProperty.linkAttribute( lonePairView, 'visible' );

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

          lonePairView.position.set( translation.x, translation.y, translation.z );
          lonePairView.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), // rotate from Y_UNIT to the desired orientation
                                                      new THREE.Vector3( orientation.x, orientation.y, orientation.z ) );
        } );
      } else {
        var atomView = new AtomView( group.element ? group.element.color : MoleculeShapesColors.atomProperty );
        atomView.group = group; // TODO: get rid of duck typing
        this.atomViews.push( atomView );
        this.add( atomView );

        if ( parentAtom === centralAtom ) {
          this.radialViews.push( atomView );
        }

        group.link( 'position', function( position ) {
          atomView.position.set( position.x, position.y, position.z );
        } );

        // TODO: rebuild bonds/angles?
        this.rebuildBonds();

        for ( var i = 0; i < this.atomViews.length; i++ ) {
          var otherView = this.atomViews[i];
          if ( otherView !== atomView ) {
            var bondAngleView = new BondAngleView( this.model, this.molecule, otherView.group, atomView.group );
            this.add( bondAngleView );
            this.angleViews.push( bondAngleView );
          }
        }
      }
    },

    removeGroup: function( group ) {
      var i;
      if ( group.isLonePair ) {
        for ( i = 0; i < this.lonePairViews.length; i++ ) {
          if ( this.lonePairViews[i].group === group ) {
            this.remove( this.lonePairViews[i] );
            this.lonePairViews.splice( i, 1 );
            break;
          }
        }
      } else {
        for ( i = 0; i < this.atomViews.length; i++ ) {
          if ( this.atomViews[i].group === group ) {
            this.remove( this.atomViews[i] );
            this.atomViews.splice( i, 1 );
            break;
          }
        }

        // reverse for ease of removal (we may need to remove multiple ones)
        for ( i = this.angleViews.length - 1; i >= 0; i-- ) {
          var bondAngleView = this.angleViews[i];

          if ( bondAngleView.aGroup === group || bondAngleView.bGroup === group ) {
            this.remove( bondAngleView );
            this.angleViews.splice( i, 1 );
          }
        }
      }
      // remove from radialViews if it is included
      for ( i = 0; i < this.radialViews.length; i++ ) {
        if ( this.radialViews[i].group === group ) {
          this.radialViews.splice( i, 1 );
          break;
        }
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
          MoleculeShapesColors.bondProperty,
          MoleculeShapesColors.bondProperty );
        view.add( bondView );
        view.bondViews.push( bondView );
      } );
    }
  } );
} );
