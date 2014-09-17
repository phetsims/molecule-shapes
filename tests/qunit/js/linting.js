(function() {
  'use strict';

  module( 'Molecule Shapes: JSHint' );

  unitTestLintFilesMatching( function( src ) {
    return src.indexOf( 'molecule-shapes/js' ) !== -1;
  } );
})();
