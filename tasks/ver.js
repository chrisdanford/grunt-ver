/*
Copyright (c) 2012 Chris Danford
Licensed under the MIT license.
*/

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

module.exports = function(grunt) {
  var ver, hash;

  grunt.registerMultiTask('ver', 'Add hashes to file names and update references to renamed files', function() {
    if (this.data.version) {
      grunt.warn('The option "version" option has been renamed to "versionFile".  Please update your task configuration.');
    }
    var versionFile = this.data.versionFile;
    if (!versionFile) {
      grunt.warn('The option "versionFile" is required.');
      return;
    }
    var baseDir = this.data.baseDir || path.dirname(versionFile);
    ver(this.data.phases, versionFile, baseDir, this.data.forceVersion);
  });

  ver = function(phases, versionFilePath, baseDir, forceVersion) {
    grunt.verbose.or.writeln('Run with --verbose for details.');
    var renameInfos = [];  // info about renamed files

    phases.forEach(function(phase) {
      var files = phase.files;
      var references = phase.references;
      var numFilesRenamed = 0;

      grunt.log.writeln('Versioning files.').writeflags(files);
      grunt.file.expand({filter: 'isFile'}, files).sort().forEach(function(f) {
        var versionHash = forceVersion || hash(f).slice(0, 8);
        var basename = path.basename(f);
        var parts = basename.split('.');

        // inject the versionHash just before the file extension
        parts.splice(parts.length-1, 0, versionHash);

        var renamedBasename = parts.join('.');
        var renamedPath = path.join(path.dirname(f), renamedBasename);

        fs.renameSync(f, renamedPath);
        grunt.verbose.write(f + ' ').ok(renamedBasename);

        var renameFrom = path.relative(baseDir, f);
        var renameTo = path.relative(baseDir, renamedPath);
        var renameFromRegex = new RegExp('\\b' + renameFrom + '\\b', 'g');

        renameInfos.push({
          from: renameFrom,
          fromRegex: renameFromRegex,
          to: renameTo
        });

        numFilesRenamed++;
      });
      grunt.log.write('Renamed ' + numFilesRenamed + ' files ').ok();

      if (references) {
        var totalReferences = 0;
        var totalReferencingFiles = 0;
        grunt.log.writeln('Replacing references.').writeflags(references);
        grunt.file.expand({filter: 'isFile'}, references).sort().forEach(function(f) {
          var content = grunt.file.read(f).toString();
          var replacedToCount = {};

          renameInfos.forEach(function(renameInfo) {
            content = content.replace(renameInfo.fromRegex, function(match) {
              if (match in replacedToCount) {
                replacedToCount[match]++;
              } else {
                replacedToCount[match] = 1;
              }
              return renameInfo.to;
            });
          });

          var replacedKeys = Object.keys(replacedToCount);
          if (replacedKeys.length > 0) {
            grunt.file.write(f, content);
            grunt.verbose.write(f + ' ').ok('replaced: ' + replacedKeys.join(', '));
            totalReferences++;
          }
          totalReferencingFiles++;
        });
        grunt.log.write('Replaced ' + totalReferences + ' in ' + totalReferencingFiles + ' files ').ok();
      }
    });

    var output = {};

    // To enable this task to run incrementally:
    // Try read the existing version file off of disk.  If it exists,
    // use its existing map, and append new entries to the map.
    // Then, prune items where the destination file no longer exists.
    try {
      output = JSON.parse(fs.readFileSync(versionFilePath));

      for (var srcFilename in output) {
        srcFilename = path.relative(baseDir, output[srcFilename]);
        if (!fs.existsSync(srcFilename)) {
            delete output[srcFilename];
        }
      }
    } catch (e) {
        // unable to read file for some reason
      grunt.log.verbose.writeln('unable to read existing file "' + versionFilePath + '"', e);
    }


    renameInfos.forEach(function(renameInfo) {
      output[renameInfo.from] = renameInfo.to;
    });
    grunt.file.write(versionFilePath, JSON.stringify(output, null, ' '));
    grunt.log.verbose.writeln(versionFilePath + ' ').ok();
  };


  // This helper is a basic wrapper around crypto.createHash.
  hash = function(filePath, algorithm, encoding) {
    algorithm = algorithm || 'md5';
    encoding = encoding || 'hex';
    var hash = crypto.createHash(algorithm);

    grunt.log.verbose.writeln('Hashing ' + filePath + '.');
    hash.update(grunt.file.read(filePath));
    return hash.digest(encoding);
  };

};
