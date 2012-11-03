var grunt = require('grunt');
var wrench = require('wrench');

require("../tasks/ver")(grunt);

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['ver'] = {
  setUp: function(done) {
    wrench.copyDirSyncRecursive('test-data/in', 'test-data/out');
    done();
  },
  'helper': function(test) {
    test.expect(1);
    grunt.helper('ver',
      [
        {
          files: ['test-data/out/**/*.{js,png}'],
          references: ['test-data/out/**/*.css'],
        },
        {
          files: ['test-data/out/**/*.css'],
        },
      ],
      'test-data/out/version.json',
      'dev'  // `undefined` to use default value
    );
    
    test.equal(grunt.file.expandFiles('test-data/out/**').length, 4);
    test.done();
  }
};
