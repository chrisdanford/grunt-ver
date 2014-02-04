var grunt = require('grunt');

exports.ver = {
  'file count is sane': function(test) {
    test.expect(1);
    test.equal(grunt.file.expand({filter: 'isFile'}, 'test/fixtures/out/testSimple/**').length, 4);
    test.done();
  },
  'replacement occurs': function(test) {
    test.expect(1);
    var contents = grunt.file.read('test/fixtures/out/testSimple/static/foo.dev.css');
    var matches = contents.match(/foo\.dev/g);
    test.equal(matches.length, 6);
    test.done();
  },
  'testSimple versions are correct': function(test) {
    test.expect(1);
    var contents = grunt.file.read('test/fixtures/out/testSimple/version.json');
    var versions = JSON.parse(contents);
    test.deepEqual(versions, {
      'static/foo.js': 'static/foo.dev.js',
      'static/foo.png': 'static/foo.dev.png',
      'static/foo.css': 'static/foo.dev.css',
    });
    test.done();
  },
  'testBaseDir versions are correct': function(test) {
    test.expect(1);
    var contents = grunt.file.read('test/fixtures/out/testBaseDir/version.json');
    var versions = JSON.parse(contents);
    test.deepEqual(versions, {
      'testBaseDir/static/foo.js': 'testBaseDir/static/foo.d41d8cd9.js',
      'testBaseDir/static/foo.png': 'testBaseDir/static/foo.d41d8cd9.png',
      'testBaseDir/static/foo.css': 'testBaseDir/static/foo.5d897631.css',
    });
    test.done();
  }
};
