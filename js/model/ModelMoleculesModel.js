// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Vector3 from '../../../dot/js/Vector3.js';
import inherit from '../../../phet-core/js/inherit.js';
import MoleculeShapesModel from '../common/model/MoleculeShapesModel.js';
import PairGroup from '../common/model/PairGroup.js';
import VSEPRMolecule from '../common/model/VSEPRMolecule.js';
import moleculeShapes from '../moleculeShapes.js';

/**
 * @constructor
 * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
 */
function ModelMoleculesModel( isBasicsVersion ) {
  const self = this;

  const initialMolecule = new VSEPRMolecule();

  MoleculeShapesModel.call( this, isBasicsVersion );
  this.moleculeProperty = new Property( initialMolecule );

  this.moleculeProperty.get().addCentralAtom( new PairGroup( new Vector3( 0, 0, 0 ), false ) );
  this.setupInitialMoleculeState();

  // when the molecule is made empty, make sure to show lone pairs again (will allow us to drag out new ones)
  this.moleculeProperty.get().bondChangedEmitter.addListener( function() {
    if ( self.moleculeProperty.get().radialLonePairs.length === 0 ) {
      self.showLonePairsProperty.set( true );
    }
  } );
}

moleculeShapes.register( 'ModelMoleculesModel', ModelMoleculesModel );

export default inherit( MoleculeShapesModel, ModelMoleculesModel, {
  /**
   * @private
   */
  setupInitialMoleculeState: function() {
    // start with two single bonds
    const centralAtom = this.moleculeProperty.get().centralAtom;
    this.moleculeProperty.get().addGroupAndBond( new PairGroup( new Vector3( 8, 0, 3 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
    this.moleculeProperty.get().addGroupAndBond( new PairGroup( new Vector3( 2, 8, -5 ).setMagnitude( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
  },

  // @override
  reset: function() {
    MoleculeShapesModel.prototype.reset.call( this );

    this.moleculeProperty.reset();

    this.moleculeProperty.get().removeAllGroups();
    this.setupInitialMoleculeState();
  }
} );