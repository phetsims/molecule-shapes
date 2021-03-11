// Copyright 2014-2020, University of Colorado Boulder

/**
 * Base model that handles a single molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import ThreeQuaternionIO from '../../../../mobius/js/ThreeQuaternionIO.js';
import moleculeShapes from '../../moleculeShapes.js';
import Molecule from './Molecule.js';
import MoleculeIO from './MoleculeIO.js';

class MoleculeShapesModel {
  /**
   * @param {boolean} isBasicsVersion
   * @param {Object} config
   * @param {Tandem} tandem
   */
  constructor( isBasicsVersion, config, tandem ) {
    assert && assert( config.initialMolecule !== undefined );

    this.isBasicsVersion = isBasicsVersion; // @public {boolean}

    // TODO: Add type info
    // @public {Property.<Molecule>} - Assumed not to change in the 1st screen (model)
    this.moleculeProperty = new Property( config.initialMolecule, {
      tandem: tandem.createTandem( 'moleculeProperty' ),
      phetioType: Property.PropertyIO( MoleculeIO ),
      valueType: Molecule
    } );

    // TODO: Add type info
    // @public {Property.<THREE.Quaternion>} - describes the rotation of the molecule view
    this.moleculeQuaternionProperty = new Property( new THREE.Quaternion(), {
      tandem: tandem.createTandem( 'moleculeQuaternionProperty' ),
      phetioType: Property.PropertyIO( ThreeQuaternionIO )
    } );

    // @public {Property.<boolean>} - Whether bond angles are shown
    this.showBondAnglesProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showBondAnglesProperty' )
    } );

    // @public {Property.<boolean>} - Whether lone pairs are shown
    this.showLonePairsProperty = new BooleanProperty( !isBasicsVersion, {
      tandem: tandem.createTandem( 'showLonePairsProperty' )
    } );

    // @public {Property.<boolean>} - Whether molecular shape names are shown
    this.showMolecularShapeNameProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showMolecularShapeNameProperty' )
    } );

    // @public {Property.<boolean>} - Whether electron shape names are shown
    this.showElectronShapeNameProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showElectronShapeNameProperty' )
    } );
  }

  /**
   * Resets values to their original state
   * @public
   */
  reset() {
    this.moleculeProperty.reset();
    this.moleculeQuaternionProperty.reset();
    this.showBondAnglesProperty.reset();
    this.showLonePairsProperty.reset();
    this.showMolecularShapeNameProperty.reset();
    this.showElectronShapeNameProperty.reset();
  }

  /**
   * Steps the model forward.
   * @public
   *
   * @param {number} dt - Elapsed time
   */
  step( dt ) {
    // cap at 0.2s, since our model doesn't handle oscillation well above that
    this.moleculeProperty.value.update( Math.min( dt, 0.2 ) );
  }
}

moleculeShapes.register( 'MoleculeShapesModel', MoleculeShapesModel );

export default MoleculeShapesModel;