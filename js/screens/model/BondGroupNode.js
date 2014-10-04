//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Displays a thumbnail of the bond type (single, double, triple) or lone pair, along with a red 'X' for removal.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/model/MoleculeShapesModel' );
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/model/VSEPRMolecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );
  var RemovePairGroupButton = require( 'MOLECULE_SHAPES/screens/model/RemovePairGroupButton' );
  var MoleculeShapesGlobals = require( 'MOLECULE_SHAPES/view/MoleculeShapesGlobals' );
  var MoleculeShapesColors = require( 'MOLECULE_SHAPES/view/MoleculeShapesColors' );
  var MoleculeShapesScreenView = require( 'MOLECULE_SHAPES/view/MoleculeShapesScreenView' );
  var MoleculeView = require( 'MOLECULE_SHAPES/view/3d/MoleculeView' );

  /*---------------------------------------------------------------------------*
  * Dynamic generation of the bonding/lone-pair panel images
  *----------------------------------------------------------------------------*/
  var scene = new THREE.Scene();
  MoleculeShapesScreenView.addLightsToScene( scene );

  var renderer = MoleculeShapesGlobals.useWebGL ? new THREE.WebGLRenderer( {
      antialias: true,
      preserveDrawingBuffer: true, // so we can toDataURL() it
      alpha: true // so we can render the transparency
    } ) : new THREE.CanvasRenderer();
  renderer.setClearColor( 0x0, 0 ); // transparent

  var camera = new THREE.OrthographicCamera();
  camera.position.set( 0, 0, 40 );
  camera.near = 1; // near clipping plane
  camera.far = 100; // far clipping plane

  function render( view, width, height, orthoSize ) {
    scene.add( view );
    camera.left = 0;
    camera.right = orthoSize;
    camera.top = orthoSize * height / width / 2; // the corresponding height given the orthoSize => width scaling
    camera.bottom = -orthoSize * height / width / 2;
    camera.updateProjectionMatrix(); // three.js requires this to be called after changing the parameters

    renderer.setSize( width, height );
    renderer.render( scene, camera );
    scene.remove( view );

    return renderer.domElement.toDataURL();
  }

  var imageScale = 3;
  var lonePairWidth = 78;
  var atomHeight = 42;
  var atomWidth = 120;
  var lonePairHeight = 55;
  function getBondDataURL( bondOrder ) {
    var molecule = new VSEPRMolecule();
    var centralAtom = new PairGroup( new Vector3(), false, false );
    molecule.addCentralAtom( centralAtom );
    molecule.addGroupAndBond( new PairGroup( Vector3.X_UNIT.times( bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ), bondOrder === 0, false ), centralAtom, bondOrder );
    var model = new MoleculeShapesModel( false, {
      molecule: molecule
    } );

    var view = new MoleculeView( model, molecule );
    view.updateView();
    view.centerAtomView.visible = false; // TODO: remove this extra outside knowledge

    var orthoSize = bondOrder === 0 ?
                    ( MoleculeView.scale * PairGroup.LONE_PAIR_DISTANCE * 1.07 ):
                    ( MoleculeView.scale * PairGroup.BONDED_PAIR_DISTANCE * 1.22 );
    return render( view, ( bondOrder === 0 ? lonePairWidth : atomWidth ) * imageScale, ( bondOrder === 0 ? lonePairHeight : atomHeight ) * imageScale, orthoSize );
  }

  // indices match up with the bond order
  var imageDataURLs = [
    getBondDataURL( 0 ),
    getBondDataURL( 1 ),
    getBondDataURL( 2 ),
    getBondDataURL( 3 )
  ];

  // TODO: updating color scheme! invalidate

  function BondGroupNode( model, bondOrder, options ) {
    var self = this;

    this.model = model;
    this.bondOrder = bondOrder;

    var addEnabled = true;

    var overlay = new Rectangle( 0, 0, 120, bondOrder !== 0 ? atomHeight : lonePairHeight, 0, 0, _.extend( { cursor: 'pointer' }, options ) );
    overlay.addInputListener( new ButtonListener( {
      fire: function() {
        if ( addEnabled ) {
          self.addPairGroup();
        }
      }
    } ) );
    var image = new Image( imageDataURLs[bondOrder], {
      scale: 1 / imageScale,
      center: overlay.center
    } );

    // move the lone pair over to the right more, so that it looks more centered
    if ( bondOrder === 0 ) {
      image.right = overlay.right - 10;
    }

    var thumbnail = new Node( { children: [image, overlay] } );
    var removeButton = new RemovePairGroupButton( {
      listener: this.removePairGroup.bind( this )
    } );
    removeButton.touchArea = removeButton.localBounds.dilatedY( 14 ).withMinX( removeButton.localBounds.minX - 10 ).withMaxX( removeButton.localBounds.maxX + 20 );
    function update() {
      addEnabled = model.molecule.wouldAllowBondOrder( bondOrder );
      // TODO: change the fill's opacity, not the actual node's opacity!
      overlay.fill = addEnabled ? 'rgba(0,0,0,0)' : MoleculeShapesColors.background.withAlpha( 0.4 );
      removeButton.visible = _.filter( model.molecule.getBonds( model.molecule.getCentralAtom() ), function( bond ) {
        return bond.order === bondOrder;
      } ).length > 0;
    }
    model.molecule.on( 'bondChanged', update );
    update();

    HBox.call( this, _.extend( {
      children: [thumbnail, removeButton],
      spacing: 10,
      align: 'center'
    }, options ) );
  }

  return inherit( HBox, BondGroupNode, {
    addPairGroup: function() {
      var pair = new PairGroup( new Vector3( 10, 20, 0 ), this.bondOrder === 0, false );
      this.model.molecule.addGroupAndBond( pair, this.model.molecule.getCentralAtom(), this.bondOrder, ( this.bondOrder === 0 ? PairGroup.LONE_PAIR_DISTANCE : PairGroup.BONDED_PAIR_DISTANCE ) / PairGroup.REAL_TMP_SCALE );
    },

    removePairGroup: function() {
      var molecule = this.model.molecule;

      var bonds = molecule.getBonds( molecule.getCentralAtom() );

      for ( var i = bonds.length - 1; i >= 0; i-- ) {
        if ( bonds[i].order === this.bondOrder ) {
          var atom = bonds[i].getOtherAtom( molecule.getCentralAtom() );

          molecule.removeGroup( atom );
          break;
        }
      }
    }
  } );
} );

