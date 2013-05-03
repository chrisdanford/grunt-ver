var grunt = require('grunt');

exports.ver = {
  'file count is sane': function(test) {
    test.expect(1);
    test.equal(grunt.file.expand({filter: 'isFile'}, 'test/fixtures/out/**').length, 4);
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
  }
};
