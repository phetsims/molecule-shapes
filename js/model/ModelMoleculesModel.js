// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../../dot/js/Vector3.js';
import MoleculeShapesModel from '../common/model/MoleculeShapesModel.js';
import PairGroup from '../common/model/PairGroup.js';
import VSEPRMolecule from '../common/model/VSEPRMolecule.js';
import moleculeShapes from '../moleculeShapes.js';

class ModelMoleculesModel extends MoleculeShapesModel {
  /**
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   * @param {Tandem} tandem
   */
  constructor( isBasicsVersion, tandem ) {

    const initialMolecule = new VSEPRMolecule();

    super( isBasicsVersion, {
      initialMolecule: initialMolecule
    }, tandem );

    this.moleculeProperty.value.addCentralAtom( new PairGroup( new Vector3( 0, 0, 0 ), false ) );
    this.setupInitialMoleculeState();
  }

  /**
   * @private
   */
  setupInitialMoleculeState() {
    // start with two single bonds
    const centralAtom = this.moleculeProperty.value.centralAtom;
    this.moleculeProperty.value.addGroupAndBond( new PairGroup( new Vector3( 8, 0, 3 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
    this.moleculeProperty.value.addGroupAndBond( new PairGroup( new Vector3( 2, 8, -5 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
  }

  /**
   * Resets values to their original state
   * @public
   * @override
   */
  reset() {
    super.reset();

    this.moleculeProperty.value.removeAllGroups();
    this.setupInitialMoleculeState();
  }
}

moleculeShapes.register( 'ModelMoleculesModel', ModelMoleculesModel );

export default ModelMoleculesModel;