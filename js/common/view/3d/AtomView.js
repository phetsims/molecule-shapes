// Copyright 2002-2014, University of Colorado Boulder

/**
 * View of an atom {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/common/view/MoleculeShapesColors' );
  var LocalGeometry = require( 'MOLECULE_SHAPES/common/view/3d/LocalGeometry' );
  var LocalMaterial = require( 'MOLECULE_SHAPES/common/view/3d/LocalMaterial' );

  var numSamples = MoleculeShapesGlobals.useWebGL ? 64 : 12;
  var localBondGeometry = new LocalGeometry( new THREE.SphereGeometry( 2, numSamples, numSamples ) );

  var overdraw = MoleculeShapesGlobals.useWebGL ? 0 : 0.5;
  var elementLocalMaterials = {
    // filled in dynamically in getElementLocalMaterial
  };

  /*
   * @param {LocalMaterial} localMaterial - preferably from one of AtomView's static methods/properties
   */
  function AtomView( renderer, localMaterial ) {
    THREE.Mesh.call( this, localBondGeometry.get( renderer ), localMaterial.get( renderer ) );
  }

  return inherit( THREE.Mesh, AtomView, {
    dispose: function() {

    }
  }, {
    centralAtomLocalMaterial: new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: overdraw } ), {
      color: MoleculeShapesColors.centralAtomProperty,
      ambient: MoleculeShapesColors.centralAtomProperty
    } ),
    atomLocalMaterial: new LocalMaterial( new THREE.MeshLambertMaterial( { overdraw: overdraw } ), {
      color: MoleculeShapesColors.atomProperty,
      ambient: MoleculeShapesColors.atomProperty
    } ),
    getElementLocalMaterial: function( element ) {
      var localMaterial = elementLocalMaterials[element.symbol];
      if ( !localMaterial ) {
        localMaterial = elementLocalMaterials[element.symbol] = new LocalMaterial( new THREE.MeshLambertMaterial( {
          color: new Color( element.color ).toNumber(),
          ambient: new Color( element.color ).toNumber(),
          overdraw: overdraw
        } ) );
      }
      return localMaterial;
    }
  } );
} );
