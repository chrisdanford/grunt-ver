var grunt = require('grunt');
var wrench = require('wrench');

exports.ver = {
  setUp: function(done) {
    wrench.copyDirSyncRecursive('test/fixtures/src', 'test/fixtures/processed');
    done();
  },
  'helper': function(test) {
    test.expect(1);    
    test.equal(grunt.file.expand('test/fixtures/processed/**').length, 4);
    test.done();
  }
};
