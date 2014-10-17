// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of the angle (sector and line) between two bonds
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var ArcVertices = require( 'MOLECULE_SHAPES/common/view/3d/ArcVertices' );
  var ArcGeometry = require( 'MOLECULE_SHAPES/common/view/3d/ArcGeometry' );
  var SectorGeometry = require( 'MOLECULE_SHAPES/common/view/3d/SectorGeometry' );
  var BondAngleView = require( 'MOLECULE_SHAPES/common/view/3d/BondAngleView' );

  function BondAngleFallbackView( model, molecule, aGroup, bGroup ) {
    BondAngleView.call( this, model, molecule, aGroup, bGroup );

    this.arcVertices = new ArcVertices( aGroup.orientation, bGroup.orientation, BondAngleView.radius, 24, null ); // radius of 5, 24 segments
    this.arcGeometry = new ArcGeometry( this.arcVertices );
    this.sectorGeometry = new SectorGeometry( this.arcVertices );

    this.sectorMaterial = new THREE.MeshBasicMaterial( {
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false, // don't write depth values, so we don't cause other transparent objects to render
      overdraw: MoleculeShapesGlobals.useWebGL ? 0 : 0.1
    } );
    this.unlinkSectorColor = MoleculeShapesGlobals.linkColor( this.sectorMaterial, MoleculeShapesColors.bondAngleSweepProperty );
    this.arcMaterial = new THREE.LineBasicMaterial( {
      transparent: true,
      opacity: 0.7,
      depthWrite: false // don't write depth values, so we don't cause other transparent objects to render
    } );
    this.unlinkArcColor = MoleculeShapesGlobals.linkColor( this.arcMaterial, MoleculeShapesColors.bondAngleArcProperty );

    this.sectorView = new THREE.Mesh( this.sectorGeometry, this.sectorMaterial );
    this.arcView = new THREE.Line( this.arcGeometry, this.arcMaterial );

    // render the bond angle views on top of everything (but still depth-testing), with arcs on top
    this.sectorView.renderDepth = 10;
    this.arcView.renderDepth = 11;

    this.add( this.sectorView );
    this.add( this.arcView );
  }

  return inherit( BondAngleView, BondAngleFallbackView, {
    dispose: function() {
      BondAngleView.prototype.dispose.call( this );

      this.arcGeometry.dispose();
      this.sectorGeometry.dispose();
      this.arcMaterial.dispose();
      this.sectorMaterial.dispose();

      this.unlinkSectorColor();
      this.unlinkArcColor();
    },

    updateView: function( lastMidpoint, localCameraOrientation ) {
      BondAngleView.prototype.updateView.call( this, lastMidpoint, localCameraOrientation );

      this.sectorMaterial.opacity = this.viewOpacity / 2;
      this.arcMaterial.opacity = this.viewOpacity * 0.7;

      this.arcVertices.setPositions( this.midpointUnit, this.planarUnit, this.viewAngle );
      this.arcGeometry.updateView();
      this.sectorGeometry.updateView();
    }
  } );
} );