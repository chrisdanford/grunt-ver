var grunt = require('grunt');

exports.ver = {
  'file count is sane': function(test) {
    test.expect(1);
    test.equal(grunt.file.expand({filter: 'isFile'}, 'test/fixtures/out/**').length, 6);
    test.done();
  },
  'replacement occurs': function(test) {
    test.expect(1);
    var contents = grunt.file.read('test/fixtures/out/static/foo.dev.css');
    var matches = contents.match(/foo\.dev/g);
    test.equal(matches.length, 6);
    test.done();
  },
  'versions are correct': function(test) {
    test.expect(1);
    var contents = grunt.file.read('test/fixtures/out/version.json');
    var versions = JSON.parse(contents);
    test.equal(grunt.util._.keys(versions).length, 3);
    test.done();
  },
  'hashes are correct': function (test) {
    test.expect(2);
    var contents = grunt.file.read('test/fixtures/out/international.json');
    var versions = JSON.parse(contents);
    var srcPath = 'test/fixtures/src/static/international.js';
    var hash = require('crypto').createHash('md5').update(grunt.file.read(srcPath), 'utf8').digest('hex').substr(0, 8);
    var filePath = 'test/fixtures/out/static/international.js';
    var hashPath = 'test/fixtures/out/static/international.' + hash + '.js';
    test.equal(versions[filePath], hashPath);
    test.ok(grunt.file.exists(hashPath));
    test.done();
  }
};
