// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Vector3 from '../../../dot/js/Vector3.js';
import MoleculeShapesModel from '../common/model/MoleculeShapesModel.js';
import PairGroup from '../common/model/PairGroup.js';
import VSEPRMolecule from '../common/model/VSEPRMolecule.js';
import moleculeShapes from '../moleculeShapes.js';

class ModelMoleculesModel extends MoleculeShapesModel {
  /**
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  constructor( isBasicsVersion ) {

    const initialMolecule = new VSEPRMolecule();

    super( isBasicsVersion );
    this.moleculeProperty = new Property( initialMolecule );

    this.moleculeProperty.get().addCentralAtom( new PairGroup( new Vector3( 0, 0, 0 ), false ) );
    this.setupInitialMoleculeState();

    // when the molecule is made empty, make sure to show lone pairs again (will allow us to drag out new ones)
    this.moleculeProperty.get().bondChangedEmitter.addListener( () => {
      if ( this.moleculeProperty.get().radialLonePairs.length === 0 ) {
        this.showLonePairsProperty.set( true );
      }
    } );
  }

  /**
   * @private
   */
  setupInitialMoleculeState() {
    // start with two single bonds
    const centralAtom = this.moleculeProperty.get().centralAtom;
    this.moleculeProperty.get().addGroupAndBond( new PairGroup( new Vector3( 8, 0, 3 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
    this.moleculeProperty.get().addGroupAndBond( new PairGroup( new Vector3( 2, 8, -5 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
  }

  /**
   * Resets values to their original state
   * @public
   * @override
   */
  reset() {
    super.reset();

    this.moleculeProperty.reset();

    this.moleculeProperty.get().removeAllGroups();
    this.setupInitialMoleculeState();
  }
}

moleculeShapes.register( 'ModelMoleculesModel', ModelMoleculesModel );

export default ModelMoleculesModel;