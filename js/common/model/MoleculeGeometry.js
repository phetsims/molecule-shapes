// Copyright 2021-2022, University of Colorado Boulder

/**
 * Represents a description of the atomic layout of the molecule.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import moleculeShapes from '../../moleculeShapes.js';
import moleculeShapesStrings from '../../moleculeShapesStrings.js';

class MoleculeGeometryValue {
  /*
   * @param {number} x
   * @param {IProperty<string>} stringProperty
   */
  constructor( x, stringProperty ) {
    // @public {number}
    this.x = x;

    // @public {IProperty<string>}
    this.stringProperty = stringProperty;
  }
}

const MoleculeGeometry = EnumerationDeprecated.byMap( {
  EMPTY: new MoleculeGeometryValue( 0, moleculeShapesStrings.shape.emptyProperty ),
  DIATOMIC: new MoleculeGeometryValue( 1, moleculeShapesStrings.shape.diatomicProperty ),
  LINEAR: new MoleculeGeometryValue( 2, moleculeShapesStrings.shape.linearProperty ), // e = 0,3,4
  BENT: new MoleculeGeometryValue( 2, moleculeShapesStrings.shape.bentProperty ), // e = 1,2
  TRIGONAL_PLANAR: new MoleculeGeometryValue( 3, moleculeShapesStrings.shape.trigonalPlanarProperty ), // e = 0
  TRIGONAL_PYRAMIDAL: new MoleculeGeometryValue( 3, moleculeShapesStrings.shape.trigonalPyramidalProperty ), // e = 1
  T_SHAPED: new MoleculeGeometryValue( 3, moleculeShapesStrings.shape.tShapedProperty ), // e = 2,3
  TETRAHEDRAL: new MoleculeGeometryValue( 4, moleculeShapesStrings.shape.tetrahedralProperty ), // e = 0
  SEESAW: new MoleculeGeometryValue( 4, moleculeShapesStrings.shape.seesawProperty ), // e = 1
  SQUARE_PLANAR: new MoleculeGeometryValue( 4, moleculeShapesStrings.shape.squarePlanarProperty ), // e = 2
  TRIGONAL_BIPYRAMIDAL: new MoleculeGeometryValue( 5, moleculeShapesStrings.shape.trigonalBipyramidalProperty ), // e = 0
  SQUARE_PYRAMIDAL: new MoleculeGeometryValue( 5, moleculeShapesStrings.shape.squarePyramidalProperty ), // e = 1
  OCTAHEDRAL: new MoleculeGeometryValue( 6, moleculeShapesStrings.shape.octahedralProperty ) // e = 0
}, {
  beforeFreeze: MoleculeGeometry => {
    /*
     * Lookup for the configuration, based on the number of pair groups it contains.
     * @public
     *
     * @param {number} x - Number of radial atoms connected to the central atom
     * @param {number} e - Number of radial lone pairs connected to the central atom
     * @returns {MoleculeGeometry}
     */
    MoleculeGeometry.getConfiguration = ( x, e ) => {
      // figure out what the name is
      if ( x === 0 ) {
        return MoleculeGeometry.EMPTY;
      }
      else if ( x === 1 ) {
        return MoleculeGeometry.DIATOMIC;
      }
      else if ( x === 2 ) {
        if ( e === 0 || e === 3 || e === 4 ) {
          return MoleculeGeometry.LINEAR;
        }
        else if ( e === 1 || e === 2 ) {
          return MoleculeGeometry.BENT;
        }
        else {
          throw new Error( `invalid x: ${x}, e: ${e}` );
        }
      }
      else if ( x === 3 ) {
        if ( e === 0 ) {
          return MoleculeGeometry.TRIGONAL_PLANAR;
        }
        else if ( e === 1 ) {
          return MoleculeGeometry.TRIGONAL_PYRAMIDAL;
        }
        else if ( e === 2 || e === 3 ) {
          return MoleculeGeometry.T_SHAPED;
        }
        else {
          throw new Error( `invalid x: ${x}, e: ${e}` );
        }
      }
      else if ( x === 4 ) {
        if ( e === 0 ) {
          return MoleculeGeometry.TETRAHEDRAL;
        }
        else if ( e === 1 ) {
          return MoleculeGeometry.SEESAW;
        }
        else if ( e === 2 ) {
          return MoleculeGeometry.SQUARE_PLANAR;
        }
        else {
          throw new Error( `invalid x: ${x}, e: ${e}` );
        }
      }
      else if ( x === 5 ) {
        if ( e === 0 ) {
          return MoleculeGeometry.TRIGONAL_BIPYRAMIDAL;
        }
        else if ( e === 1 ) {
          return MoleculeGeometry.SQUARE_PYRAMIDAL;
        }
        else {
          throw new Error( `invalid x: ${x}, e: ${e}` );
        }
      }
      else if ( x === 6 ) {
        if ( e === 0 ) {
          return MoleculeGeometry.OCTAHEDRAL;
        }
        else {
          throw new Error( `invalid x: ${x}, e: ${e}` );
        }
      }
      else {
        throw new Error( `unknown VSEPR configuration x: ${x}, e: ${e}` );
      }
    };
  }
} );

moleculeShapes.register( 'MoleculeGeometry', MoleculeGeometry );
export default MoleculeGeometry;