/*
Copyright (c) 2012 Chris Danford
Licensed under the MIT license.
*/

var fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');

module.exports = function(grunt) {
  var ver, hash;

  grunt.registerMultiTask('ver', 'Add hashes to file names and update references to renamed files', function() {
    ver(this.data.phases, this.data.version, this.data.forceVersion);
  });

  // TODO: Expose as a helper for possible consumption by other tasks.
  ver = function(phases, versionFilePath, forceVersion) {
    grunt.verbose.or.writeln('Run with --verbose for details.');
    var versions = {},  // map from original file name to version info
      simpleVersions = {};

    phases.forEach(function(phase) {
      var files = phase.files, 
        references = phase.references,
        numFilesRenamed = 0;

      grunt.log.writeln('Versioning files.').writeflags(files);
      grunt.file.expand({filter: 'isFile'}, files).sort().forEach(function(f) {
        var version = forceVersion || hash(f).slice(0, 8),
          basename = path.basename(f),
          parts = basename.split('.'),
          renamedBasename,
          renamedPath;

        // inject the version just before the file extension
        parts.splice(parts.length-1, 0, version);

        renamedBasename = parts.join('.');
        renamedPath = path.join(path.dirname(f), renamedBasename);

        fs.renameSync(f, renamedPath);
        grunt.verbose.write(f + ' ').ok(renamedBasename);

        versions[f] = {
          basename: basename,
          version: version,
          renamedBasename: renamedBasename,
          renamedPath: renamedPath,
        };
        simpleVersions[f] = renamedPath;
        numFilesRenamed++;
      });
      grunt.log.write('Renamed ' + numFilesRenamed + ' files ').ok();

      if (references) {
        var totalReferences = 0;
        var totalReferencingFiles = 0;
        grunt.log.writeln('Replacing references.').writeflags(references);
        grunt.file.expand({filter: 'isFile'}, references).sort().forEach(function(f) {
          var content = grunt.file.read(f).toString(),
            replacedToCount = {},
            replacedKeys;

          Object.keys(versions).forEach(function(key) {
            var to = versions[key],
              regex = new RegExp('\\b' + to.basename + '\\b', 'g');

            content = content.replace(regex, function(match) {
              if (match in replacedToCount) {
                replacedToCount[match]++;
              } else {
                replacedToCount[match] = 1;
              }
              return to.renamedBasename;
            });
          });

          replacedKeys = Object.keys(replacedToCount);
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

    if (versionFilePath) {
      grunt.log.writeln('Writing version file.');
      grunt.file.write(versionFilePath, JSON.stringify(simpleVersions, null, ' '));
      grunt.log.write(versionFilePath + ' ').ok();
    }
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
