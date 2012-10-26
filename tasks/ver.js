/*
 version - a task for grunt that:
  
  1) Renames files in-place to add a version tag that is based on the file contents.

  2) (optional) Updates references to the renamed files.  Replacement is done in-place using
  a naive find/replace of the original basename of the file (e.g. 'logo.png') to the versioned basename
  (e.g. 'logo.abc123.png').  You can specify which files to replace over via the 'references' option.
  
  3) (optional) Writes a json file containing version information.  This can be consumed by an external 
  application.

  Versioning and replacements are done in one or more 'phases'.  This is necessary when you update file
  references inside of files that also need to be versioned.  For example: CSS files refer to versioned 
  image files, but the CSS files themselves need to be versioned.  The CSS files cannot be versioned
  until the references have been updated because versioning depends on the file contents being 
  finalized.

  Example configuration in grunt.js:

    version: {
      webapp: {
        phases: [
          {
            files: [
              'images/*.png'
            ],
            references: [
              'css/*.css'
            ]
          },
          {
            files: [
              'css/*.css',
              'js/*.js'
            ]
          }
        ],
        version: 'build/version.json'
      }
    }
*/

var fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');

module.exports = function(grunt) {
  grunt.registerMultiTask('ver', 'Add hashes to file names and update references to renamed files', function() {
    grunt.helper('ver', this.data.phases, this.data.version);
  });

  // Expose as a helper for possible consumption by other tasks.
  grunt.registerHelper('ver', function(phases, versionFilePath) {
    var versions = {};  // map from original file name to version info

    phases.forEach(function(phase) {
      var files = phase.files, 
        references = phase.references;

      grunt.log.writeln('Versioning files.');
      grunt.file.expandFiles(files).forEach(function(f) {
        var hash = grunt.helper('hash', f),
          version = hash.slice(0, 8),
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
      grunt.file.write(versionFilePath, JSON.stringify(versions, null, ' '));
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



