// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of the angle (sector and line) between two bonds
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Util = require( 'DOT/Util' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var ArcVertices = require( 'MOLECULE_SHAPES/view/3d/ArcVertices' );
  var ArcGeometry = require( 'MOLECULE_SHAPES/view/3d/ArcGeometry' );
  var SectorGeometry = require( 'MOLECULE_SHAPES/view/3d/SectorGeometry' );


  function BondAngleView( model, molecule, aGroup, bGroup ) {
    var self = this;

    THREE.Object3D.call( this );

    this.model = model;
    this.molecule = molecule;

    // @public
    this.aGroup = aGroup;
    this.bGroup = bGroup;

    this.arcVertices = new ArcVertices( aGroup.position.normalized(), bGroup.position.normalized(), 5, 24, null ); // radius of 5, 24 segments
    this.arcGeometry = new ArcGeometry( this.arcVertices );
    this.sectorGeometry = new SectorGeometry( this.arcVertices );

    this.sectorMaterial = new THREE.MeshBasicMaterial( {
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
        overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.1
    } );
    MoleculeShapesColors.link( 'bondAngleSweep', function( color ) {
      self.sectorMaterial.color.setHex( color.toNumber() );
    } );
    this.arcMaterial = new THREE.LineBasicMaterial( {
      transparent: true,
      opacity: 0.7
    } );
    MoleculeShapesColors.link( 'bondAngleArc', function( color ) {
      self.arcMaterial.color.setHex( color.toNumber() );
    } );

    this.sectorView = new THREE.Mesh( this.sectorGeometry, this.sectorMaterial );
    this.arcView = new THREE.Line( this.arcGeometry, this.arcMaterial );

    this.add( this.sectorView );
    this.add( this.arcView );

    // TODO: slightly nudge so z-order sorting works well
  }

  return inherit( THREE.Object3D, BondAngleView, {
    updateView: function( lastMidpoint ) {
      // TODO: we're doing this too much, refactor into one place in MoleculeView!
      var cameraPosition = new THREE.Vector3().copy( MoleculeShapesScreenView.cameraPosition ); // this SETS cameraPosition
      this.parent.worldToLocal( cameraPosition ); // this mutates cameraPosition

      var localCameraPosition = new Vector3( cameraPosition.x, cameraPosition.y, cameraPosition.z ).normalized();

      var aDir = this.aGroup.position.normalized();
      var bDir = this.bGroup.position.normalized();

      var alpha = this.model.showBondAngles ? BondAngleView.calculateBrightness( aDir, bDir, localCameraPosition, this.molecule.getRadialAtoms().length ) : 0;
      if ( alpha > 0 ) {
        this.sectorView.visible = true;
        this.arcView.visible = true;

        this.sectorMaterial.opacity = alpha / 2;
        this.arcMaterial.opacity = alpha * 0.7;

        this.arcVertices.setPositions( aDir, bDir, lastMidpoint );
        this.arcGeometry.updateView();
        this.sectorGeometry.updateView();

        var nudgeFactor = 0.0001;
        this.position.set( this.arcVertices.midpoint.x * nudgeFactor,
                           this.arcVertices.midpoint.y * nudgeFactor,
                           this.arcVertices.midpoint.z * nudgeFactor );
      } else {
        this.sectorView.visible = false;
        this.arcView.visible = false;
      }
    },

    get midpoint() { return this.arcVertices.midpoint; }
  }, {
    lowThresholds: [0, 0, 0, 0, 0.35, 0.45, 0.5],
    highThresholds: [0, 0, 0, 0.5, 0.55, 0.65, 0.75],

    calculateBrightness: function( aDir, bDir, localCameraPosition, bondQuantity ) {
      // if there are less than 3 bonds, always show the bond angle. (experimental)
      if ( bondQuantity <= 2 ) {
        return 1;
      }

      // a combined measure of how close the angles are AND how orthogonal they are to the camera
      var brightness = Math.abs( aDir.cross( bDir ).dot( localCameraPosition ) );

      var lowThreshold = BondAngleView.lowThresholds[bondQuantity];
      var highThreshold = BondAngleView.highThresholds[bondQuantity];

      var interpolatedValue = brightness / ( highThreshold - lowThreshold ) - lowThreshold / ( highThreshold - lowThreshold );

      return Util.clamp( interpolatedValue, 0, 1 );
    }
  } );
} );
