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
    AttractorModel: require( 'MOLECULE_SHAPES/model/AttractorModel' ),
    Bond: require( 'MOLECULE_SHAPES/model/Bond' ),
    GeometryConfiguration: require( 'MOLECULE_SHAPES/model/GeometryConfiguration' ),
    LocalShape: require( 'MOLECULE_SHAPES/model/LocalShape' ),
    Molecule: require( 'MOLECULE_SHAPES/model/Molecule' ),
    PairGroup: require( 'MOLECULE_SHAPES/model/PairGroup' ),
    RealMolecule: require( 'MOLECULE_SHAPES/model/RealMolecule' ),
    VseprConfiguration: require( 'MOLECULE_SHAPES/model/VseprConfiguration' ),
    VSEPRMolecule: require( 'MOLECULE_SHAPES/model/VSEPRMolecule' ),

    // externals used for debugging
    Element: require( 'NITROGLYCERIN/Element' )
  };
} );
