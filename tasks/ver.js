/*
Copyright (c) 2012 Chris Danford
Licensed under the MIT license.
*/

var fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');

module.exports = function(grunt) {
  grunt.registerMultiTask('ver', 'Add hashes to file names and update references to renamed files', function() {
    grunt.helper('ver', this.data.forceVersion, this.data.phases, this.data.version);
  });

  // Expose as a helper for possible consumption by other tasks.
  grunt.registerHelper('ver', function(forceVersion, phases, versionFilePath) {
    var versions = {},  // map from original file name to version info
      simpleVersions = {};

    phases.forEach(function(phase) {
      var files = phase.files, 
        references = phase.references;

      grunt.log.writeln('Versioning files.');
      grunt.file.expandFiles(files).forEach(function(f) {
        var version = forceVersion || grunt.helper('hash', f).slice(0, 8),
          basename = path.basename(f),
          parts = basename.split('.'),
          renamedBasename,
          renamedPath;

        // inject the version just before the file extension
        parts.splice(parts.length-1, 0, version);

        renamedBasename = parts.join('.');
        renamedPath = path.join(path.dirname(f), renamedBasename);

        fs.renameSync(f, renamedPath);
        grunt.log.write(f + ' ').ok(renamedBasename);

        versions[f] = {
          basename: basename,
          version: version,
          renamedBasename: renamedBasename,
          renamedPath: renamedPath,
        };
        simpleVersions[f] = renamedPath;
      });

      if (references) {
        grunt.log.writeln('Replacing instances.');
        grunt.file.expandFiles(references).forEach(function(f) {
          var content = grunt.file.read(f).toString(),
            replacedToCount = {},
            replacedKeys;

          Object.keys(versions).forEach(function(key) {
            var to = versions[key],
              regex = new RegExp(to.basename,"g")
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
            grunt.log.write(f + ' ').ok('replaced: ' + replacedKeys.join(', '));
          }
        });
      }
    });

    if (versionFilePath) {
      grunt.log.writeln('Writing version file.');
      grunt.file.write(versionFilePath, JSON.stringify(simpleVersions, null, ' '));
      grunt.log.write(versionFilePath + ' ').ok();
    }
  });


  // This helper is a basic wrapper around crypto.createHash.
  grunt.registerHelper('hash', function(filePath, algorithm, encoding) {
    algorithm = algorithm || 'md5';
    encoding = encoding || 'hex';
    var hash = crypto.createHash(algorithm);

    grunt.log.verbose.write('Hashing ' + filePath + '.');
    hash.update(grunt.file.read(filePath));
    return hash.digest(encoding);
  });

};



