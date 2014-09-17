//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for the 'Real' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * Main constructor for RealMoleculesModel, which creates the bar magnet..
   * @constructor
   */
  function RealMoleculesModel() {
  }

  return inherit( Object, RealMoleculesModel, {

    // Resets all model elements
    reset: function() {
    },

    // Called by the animation loop. Optional, so if your model has no animation, you can omit this.
    step: function() {
      // Handle model animation here.
    }
  } );
} );
