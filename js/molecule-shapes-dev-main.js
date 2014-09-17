//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Development testing entry point
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  return {
    Atom: require( 'MOLECULE_SHAPES/model/Atom' ),
    Bond: require( 'MOLECULE_SHAPES/model/Bond' ),
    LocalShape: require( 'MOLECULE_SHAPES/model/LocalShape' ),
    PairGroup: require( 'MOLECULE_SHAPES/model/PairGroup' ),

    // externals used for debugging
    Element: require( 'NITROGLYCERIN/Element' )
  };
} );
