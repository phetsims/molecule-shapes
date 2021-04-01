// Copyright 2014-2020, University of Colorado Boulder

/**
 * Base model that handles a single molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import ThreeQuaternionIO from '../../../../mobius/js/ThreeQuaternionIO.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import moleculeShapes from '../../moleculeShapes.js';
import Bond from './Bond.js';
import ElectronGeometry from './ElectronGeometry.js';
import Molecule from './Molecule.js';
import MoleculeGeometry from './MoleculeGeometry.js';
import PairGroup from './PairGroup.js';
import RealMolecule from './RealMolecule.js';
import RealMoleculeShape from './RealMoleculeShape.js';
import VSEPRMolecule from './VSEPRMolecule.js';

class MoleculeShapesModel extends PhetioObject {
  /**
   * @param {boolean} isBasicsVersion
   * @param {Object} config
   * @param {Tandem} tandem
   */
  constructor( isBasicsVersion, config, tandem ) {
    assert && assert( config.initialMolecule !== undefined );

    config = merge( {
      tandem: tandem,
      phetioType: MoleculeShapesModel.MoleculeShapesModelIO,
      phetioDocumentation: 'The main model for the Molecule Shapes screen'
    }, config );

    super( config );

    this.isBasicsVersion = isBasicsVersion; // @public {boolean}

    // @public {Property.<Molecule>} - Assumed not to change in the 1st screen (model)
    this.moleculeProperty = new Property( config.initialMolecule, {
      tandem: Tandem.OPT_OUT,
      valueType: Molecule
    } );

    // @public {Property.<ElectronGeometry>}
    this.electronGeometryProperty = new EnumerationProperty( ElectronGeometry, this.moleculeProperty.value.getCentralVSEPRConfiguration().electronGeometry, {
      tandem: tandem.createTandem( 'electronGeometryProperty' ),
      phetioReadOnly: true
    } );

    // @public {Property.<MoleculeGeometry>}
    this.moleculeGeometryProperty = new EnumerationProperty( MoleculeGeometry, this.moleculeProperty.value.getCentralVSEPRConfiguration().moleculeGeometry, {
      tandem: tandem.createTandem( 'moleculeGeometryProperty' ),
      phetioReadOnly: true
    } );

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
    this.showMoleculeGeometryProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showMoleculeGeometryProperty' )
    } );

    // @public {Property.<boolean>} - Whether electron shape names are shown
    this.showElectronGeometryProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showElectronGeometryProperty' )
    } );

    const updateMolecularBonds = () => {
      const vseprConfiguration = this.moleculeProperty.value.getCentralVSEPRConfiguration();
      this.electronGeometryProperty.value = vseprConfiguration.electronGeometry;
      this.moleculeGeometryProperty.value = vseprConfiguration.moleculeGeometry;
    };

    this.moleculeProperty.link( ( newMolecule, oldMolecule ) => {
      if ( oldMolecule ) {
        oldMolecule.bondChangedEmitter.removeListener( updateMolecularBonds );
      }
      if ( newMolecule ) {
        newMolecule.bondChangedEmitter.addListener( updateMolecularBonds );
      }
      updateMolecularBonds();
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
    this.showMoleculeGeometryProperty.reset();
    this.showElectronGeometryProperty.reset();
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

// @public {IOType}
MoleculeShapesModel.MoleculeShapesModelIO = new IOType( 'MoleculeShapesModelIO', {
  valueType: MoleculeShapesModel,
  toStateObject: model => {
    const molecule = model.moleculeProperty.value;

    const result = {
      isReal: molecule.isReal,
      groups: molecule.groups.map( group => group.toStateObject( molecule.centralAtom ) ),
      bonds: molecule.bonds.map( bond => bond.toStateObject( molecule.groups ) )
    };
    const data = result;

    if ( molecule.isReal ) {
      data.realMoleculeShape = RealMoleculeShape.RealMoleculeShapeIO.toStateObject( molecule.realMoleculeShape );
    }
    else {
      data.bondLengthOverride = molecule.bondLengthOverride;
    }
    return result;
  },
  applyState: ( model, obj ) => {
    const data = obj;

    if ( data.isReal ) {
      const molecule = new RealMolecule( RealMoleculeShape.RealMoleculeShapeIO.fromStateObject( data.realMoleculeShape ) );
      const groups = data.groups.map( groupObj => PairGroup.fromStateObject( groupObj ) );

      groups.forEach( ( group, index ) => {
        molecule.groups[ index ].positionProperty.value = group.positionProperty.value;
        molecule.groups[ index ].velocityProperty.value = group.velocityProperty.value;
      } );

      model.moleculeProperty.value = molecule;
    }
    else {
      const molecule = new VSEPRMolecule();
      molecule.bondLengthOverride = data.bondLengthOverride;

      const groups = data.groups.map( groupObj => PairGroup.fromStateObject( groupObj ) );
      groups.filter( group => group.isCentralAtom ).forEach( group => {
        molecule.addCentralAtom( group );
      } );
      groups.filter( group => !group.isCentralAtom ).forEach( group => {
        molecule.addGroup( group, false );
      } );

      data.bonds.forEach( bondObj => {
        molecule.addBond( Bond.fromStateObject( bondObj, groups ) );
      } );

      model.moleculeProperty.value = molecule;
    }
  }
} );

moleculeShapes.register( 'MoleculeShapesModel', MoleculeShapesModel );
export default MoleculeShapesModel;