// Copyright 2014-2016, University of Colorado Boulder

/**
 * Base model that handles a single molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var inherit = require( 'PHET_CORE/inherit' );
  var extend = require( 'PHET_CORE/extend' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   * @param {boolean} isBasicsVersion
   * @param {Object} [options]
   */
  function MoleculeShapesModel( isBasicsVersion, options ) {
    this.isBasicsVersion = isBasicsVersion; // @public {boolean}

    PropertySet.call( this, extend( {
      molecule: null, // @public {Molecule} - Assumed not to change in the 1st screen (model)
      moleculeQuaternion: new THREE.Quaternion(), // @public {THREE.Quaternion} - describes the rotation of the molecule view
      showBondAngles: false, // @public {boolean} - Whether bond angles are shown
      showLonePairs: !isBasicsVersion, // @public {boolean} - Whether lone pairs are shown
      showMolecularShapeName: false, // @public {boolean} - Whether molecular shape names are shown
      showElectronShapeName: false // @public {boolean} - Whether electron shape names are shown
    }, options ) );
  }

  moleculeShapes.register( 'MoleculeShapesModel', MoleculeShapesModel );

  return inherit( PropertySet, MoleculeShapesModel, {
    /**
     * Steps the model forward.
     * @public
     *
     * @param {number} dt - Elapsed time
     */
    step: function( dt ) {
      // cap at 0.2s, since our model doesn't handle oscillation well above that
      this.molecule.update( Math.min( dt, 0.2 ) );
    }
  } );
} );
