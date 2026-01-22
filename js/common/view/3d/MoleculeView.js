// Copyright 2014-2016, University of Colorado Boulder

/**
 * View of a Molecule {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
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

    this.model = model; // @private {MoleculeShapesModel}
    this.screenView = screenView; // @private {MoleculeShapesScreenView}
    this.renderer = screenView.threeRenderer; // @private {THREE.Renderer}
    this.molecule = molecule; // @private

    this.atomViews = []; // @private {Array.<AtomView>}
    this.lonePairViews = []; // @private {Array.<LonePairView>}
    this.bondViews = []; // @private {Array.<BondView>}
    this.angleViews = []; // @private {BondAngleWebGLView[] | Array.<BondAngleFallbackView>}

    this.radialViews = []; // @private {Array.<AtomView | LonePairView>} all views that we would want to drag

    this.lastMidpoint = null; // @private {Vector3 | null} - The last bond-angle midpoint for a 2-atom system globally

    molecule.on( 'groupAdded', this.addGroup.bind( this ) );
    molecule.on( 'groupRemoved', this.removeGroup.bind( this ) );
    molecule.on( 'bondAdded', this.addBond.bind( this ) );
    molecule.on( 'bondRemoved', this.removeBond.bind( this ) );

    // initial setup
    _.each( molecule.radialGroups, this.addGroup.bind( this ) );
    _.each( molecule.getDistantLonePairs(), this.addGroup.bind( this ) );
    _.each( molecule.getBondsAround( molecule.centralAtom ), this.addBond.bind( this ) );

    // @private - the center atom is special
    if ( molecule.isReal ) {
      this.centerAtomView = new AtomView( molecule.centralAtom, this.renderer, AtomView.getElementLocalMaterial( molecule.centralAtom.element ) );
    }
    else {
      this.centerAtomView = new AtomView( molecule.centralAtom, this.renderer, AtomView.centralAtomLocalMaterial );
    }
    this.add( this.centerAtomView );
  }

  moleculeShapes.register( 'MoleculeView', MoleculeView );

  return inherit( THREE.Object3D, MoleculeView, {

    /**
     * Updates the entire view (including bonds and angles)
     * @public
     */
    updateView: function() {
      // angle and bond views need to know information about the camera's position
      var cameraPosition = new THREE.Vector3().copy( MoleculeShapesScreenView.cameraPosition ); // this SETS cameraPosition
      this.worldToLocal( cameraPosition ); // this mutates cameraPosition
      var localCameraOrientation = new Vector3().set( cameraPosition ).normalized();

      for ( var i = 0; i < this.bondViews.length; i++ ) {
        this.bondViews[ i ].updateView( cameraPosition );
      }
      this.updateAngles( localCameraOrientation );
    },

    /**
     * Updates the angle views
     * @public
     *
     * @param {Vector3} localCameraOrientation - A unit vector pointing towards the camera in the molecule's local
     *                                           coordinate frame
     */
    updateAngles: function( localCameraOrientation ) {
      // we need to handle the 2-atom case separately for proper support of 180-degree bonds
      var hasTwoBonds = this.molecule.radialAtoms.length === 2;
      if ( !hasTwoBonds ) {
        // if we don't have two bonds, just ignore the last midpoint
        this.lastMidpoint = null;
      }

      for ( var i = 0; i < this.angleViews.length; i++ ) {
        var angleView = this.angleViews[ i ];
        angleView.updateView( this.lastMidpoint, localCameraOrientation );

        // if we have two bonds, store the last midpoint so we can keep the bond midpoint stable
        if ( hasTwoBonds ) {
          this.lastMidpoint = angleView.midpoint.normalized();
        }
      }
    },

    /**
     * Disposes this view, so that its components can be reused for new molecules.
     * @public
     */
    dispose: function() {
      var i;
      for ( i = 0; i < this.angleViews.length; i++ ) {
        this.screenView.returnLabel( this.angleViews[ i ].label );
        this.angleViews[ i ].dispose();
      }
      for ( i = 0; i < this.lonePairViews.length; i++ ) {
        this.lonePairViews[ i ].dispose();
      }
    },

    /**
     * Adds a pair group.
     * @public
     *
     * @param {PairGroup} group
     */
    addGroup: function( group ) {
      // ignore the central atom, we add it in the constructor by default
      if ( group === this.molecule.centralAtom ) {
        return;
      }

      var parentAtom = this.molecule.getParent( group );
      var centralAtom = this.molecule.centralAtom;
      var view;
      if ( group.isLonePair ) {
        var visibilityProperty = parentAtom === centralAtom ?
                                 this.model.showLonePairsProperty :
                                 MoleculeShapesGlobals.showOuterLonePairsProperty;

        view = LonePairView.pool.get( this.renderer ).initialize( group, parentAtom, visibilityProperty );
        this.lonePairViews.push( view );
      }
      else {
        view = new AtomView( group, this.renderer, group.element ?
                                                   AtomView.getElementLocalMaterial( group.element ) :
                                                   AtomView.atomLocalMaterial );
        this.atomViews.push( view );

        group.link( 'position', function( position ) {
          view.position.set( position.x, position.y, position.z );
        } );

        for ( var i = 0; i < this.atomViews.length; i++ ) {
          var otherView = this.atomViews[ i ];
          if ( otherView !== view ) {
            var bondAngleView = MoleculeShapesGlobals.useWebGL ?
                                BondAngleWebGLView.pool.get( this.renderer ) :
                                BondAngleFallbackView.pool.get( this.renderer );
            bondAngleView.initialize( this.screenView, this.model.showBondAnglesProperty, this.molecule, otherView.group, view.group, this.screenView.checkOutLabel() );
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

    /**
     * Removes a pair group.
     * @public
     *
     * @param {PairGroup} group
     */
    removeGroup: function( group ) {
      var i;
      if ( group.isLonePair ) {
        // remove the lone pair view itself
        for ( i = 0; i < this.lonePairViews.length; i++ ) {
          var lonePairView = this.lonePairViews[ i ];
          if ( lonePairView.group === group ) {
            this.remove( lonePairView );
            lonePairView.dispose();
            this.lonePairViews.splice( i, 1 );
            break;
          }
        }
      }
      else {
        // remove the atom view itself
        for ( i = 0; i < this.atomViews.length; i++ ) {
          var atomView = this.atomViews[ i ];
          if ( atomView.group === group ) {
            this.remove( atomView );
            this.atomViews.splice( i, 1 );
            break;
          }
        }

        // remove any bond angles involved, reversed for ease of removal (we may need to remove multiple ones)
        for ( i = this.angleViews.length - 1; i >= 0; i-- ) {
          var bondAngleView = this.angleViews[ i ];

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
        if ( this.radialViews[ i ].group === group ) {
          this.radialViews.splice( i, 1 );
          break;
        }
      }
    },

    /**
     * Adds a bond.
     * @public
     *
     * @param {Bond.<PairGroup>} bond
     */
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

    /**
     * Removes a bond.
     * @public
     *
     * @param {Bond.<PairGroup>} bond
     */
    removeBond: function( bond ) {
      for ( var i = this.bondViews.length - 1; i >= 0; i-- ) {
        var bondView = this.bondViews[ i ];
        if ( bondView.bond === bond ) {
          this.remove( bondView );
          this.bondViews.splice( i, 1 );
        }
      }
    },

    /**
     * Changes the view for the BondGroupNode.
     * @public
     */
    hideCentralAtom: function() {
      this.centerAtomView.visible = false;
    },

    /**
     * Changes the view for ScreenIconNode.
     * @public
     *
     * @param {number} moleculeScale
     * @param {number} atomScale
     * @param {number} bondScale
     */
    tweakViewScales: function( moleculeScale, atomScale, bondScale ) {
      this.scale.x = this.scale.y = this.scale.z = moleculeScale;
      this.centerAtomView.scale.x = this.centerAtomView.scale.y = this.centerAtomView.scale.z = atomScale;
      _.each( this.atomViews, function( atomView ) {
        atomView.scale.x = atomView.scale.y = atomView.scale.z = atomScale;
      } );
      _.each( this.bondViews, function( bondView ) {
        _.each( bondView.children, function( child ) {
          child.scale.x = child.scale.z = bondScale;
          if ( bondView.bondOrder > 1 ) {
            child.position.y *= 2 * bondScale;
          }
        } );
      } );
    }
  } );
} );
