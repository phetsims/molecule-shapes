// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base model that handles a single molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var extend = require( 'PHET_CORE/extend' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   * @param {boolean} isBasicsVersion
   * @param {Object} [options]
   */
  function MoleculeShapesModel( isBasicsVersion, options ) {
    this.isBasicsVersion = isBasicsVersion;

    PropertySet.call( this, extend( {
      molecule: null, // {Molecule}, assumed not to change in the 1st screen (model)
      moleculeQuaternion: new THREE.Quaternion(), // {THREE.Quaternion}, describes the rotation of the molecule view
      showBondAngles: false,
      showLonePairs: !isBasicsVersion,
      showMolecularShapeName: false,
      showElectronShapeName: false
    }, options ) );
  }

  return inherit( PropertySet, MoleculeShapesModel, {
    step: function( dt ) {
      // cap at 0.2s, since our model doesn't handle oscillation well above that
      this.molecule.update( Math.min( dt, 0.2 ) );
    }
  } );
} );
