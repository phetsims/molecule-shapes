//  Copyright 2002-2014, University of Colorado Boulder

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
   *
   * TODO: verify that these are triggered and handled
   * Triggered events:
   * - mouseEvent
   * - keyboardEvent
   * - beforeFrameRender
   * - timeChangeNotifier
   */
  function MoleculeShapesModel( isBasicsVersion, options ) {
    this.isBasicsVersion = isBasicsVersion;

    PropertySet.call( this, extend( {
      molecule: null, // {Molecule}
      showBondAngles: false,
      showLonePairs: !isBasicsVersion,
      showAllLonePairs: false
    }, options ) );
  }

  return inherit( PropertySet, MoleculeShapesModel, {

    reset: function() {
    },

    step: function( dt ) {
      this.molecule.update( Math.min( dt, 1 ) ); // cap at 1 second
    }
  } );
} );
