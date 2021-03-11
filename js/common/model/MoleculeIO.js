// Copyright 2013-2020, University of Colorado Boulder

/**
 * Base type of model of a single-atom-centered molecule which has a certain number of pair groups
 * surrounding it. Concrete sub-types should implement the methods documented at the start of the prototype.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import moleculeShapes from '../../moleculeShapes.js';
import Molecule from './Molecule.js';
import RealMolecule from './RealMolecule.js';
import RealMoleculeShape from './RealMoleculeShape.js';
import VSEPRMolecule from './VSEPRMolecule.js';

const MoleculeIO = new IOType( 'MoleculeIO', {
  valueType: Molecule,
  documentation: 'Represents a molecule all of the atom/bond information',
  toStateObject: molecule => {
    const result = {
      private: {}
    };
    const data = result.private;

    data.isReal = molecule.isReal;

    if ( molecule.isReal ) {
      data.realMoleculeShape = RealMoleculeShape.RealMoleculeShapeIO.toStateObject( molecule.realMoleculeShape );
    }
    else {
      data.bondLengthOverride = molecule.bondLengthOverride;
    }
    return result;
  },
  fromStateObject: obj => {
    if ( obj.private.isReal ) {
      return new RealMolecule( RealMoleculeShape.RealMoleculeShapeIO.fromStateObject( obj.private.realMoleculeShape ) );
    }
    else {
      return new VSEPRMolecule();
    }
  }
} );

moleculeShapes.register( 'MoleculeIO', MoleculeIO );

export default MoleculeIO;