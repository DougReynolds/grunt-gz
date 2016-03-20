/*
 * grunt-gz
 * https://github.com/DougReynolds/grunt-gz
 *
 * Copyright (c) 2016 Douglas Reynolds
 * Licensed under the MIT license.
 */

'use strict';

var zlib = require( 'zlib' );
var fs = require( 'fs' );

module.exports = function(grunt) {
  grunt.registerMultiTask('gz', 'Grunt gzip task', function() {
    var gzip = zlib.createGunzip();
    var processComplete = this.async();

    // create sourceFiles array and populate it
    var sourceFiles = [];
    grunt.file.recurse( grunt.config.get( 'gz.files.source' ), function( abspath, rootdir, subdir, filename ){
      sourceFiles.push( filename );
    });

     // Async function which obtains files from source directory
     //  configuration and archives them in gzip format to a
     //  distribution directory.
    function gzip_sourceFiles() {
      // Check sourceFiles array to see if any files left to process
      if(sourceFiles.length <= 0) {
          processComplete();
          return;
      }

      // set value to removed file from array
      var srcFile = sourceFiles.pop();

      // the source distribution directories
      var src = grunt.config.get( 'gz.files.source' );
      var dist = grunt.config.get( 'gz.files.dist' );

      // create the distribution directory if it does not exist
      if ( !fs.existsSync( dist ) ){
          fs.mkdirSync( dist );
      } else {
        // recurse the distribution directory to check for hidden files
        grunt.file.recurse( dist, function( abspath, rootdir, subdir, filename ){
          // skip hidden files
          if ( filename.indexOf('.') === 0 ) {
            console.log( 'Hidden file ' + filename );
            gzip_sourceFiles();
            return;
          }
        });
      }

      // the file to be gzipped
      var fileToZip = grunt.file.read( src + '/' + srcFile, { encoding: null } );

      if ( srcFile.indexOf( '.' ) === 0 ) {
        console.log( 'hidden file 2 ' + srcFile );
        gzip_sourceFiles();
        return;
      }

      grunt.log.writeln( "Compressing " + srcFile + " ..." );
      
      // zlib gzip method to compress the file and write to distribution directory
      zlib.gzip( fileToZip, function( err, gzipped ) {
          grunt.file.write( dist + '/' + srcFile + '.gz', gzipped );
          grunt.log.ok( "Compressed file written to " + dist );

        // recursively call ourself
        gzip_sourceFiles();
      });
    }
    // start the gzip process
    gzip_sourceFiles();
  });

};
