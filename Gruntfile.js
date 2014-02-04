var _ = require('lodash');

module.exports = function(grunt) {

  var config = {};

  config.jshint = {
    options: {
      curly: true,
      eqeqeq: true,
      immed: true,
      latedef: true,
      newcap: true,
      noarg: true,
      nomen: false,
      sub: true,
      undef: true,
      boss: true,
      eqnull: true,
      node: true,
      strict: false,
      globals: {},
    },
    app: [
      'Gruntfile.js',
      'tasks/*.js',
      'test/*.js'
    ]
  };

  config.clean = {
    test: [
      'test/fixtures/out'
    ]
  };

  config.nodeunit = {
    files: [
      'test/*.js'
    ]
  };

  config.exec = {
    publish: {
      command: 'npm publish .',
    }
  };

  config.copy = {
    testSimple: {
      files: [
        {
          expand: true,
          cwd: 'test/fixtures/src/',
          src: ['**'],
          dest: 'test/fixtures/out/testSimple/',
        }
      ]
    },
    testBaseDir: {
      files: [
        {
          expand: true,
          cwd: 'test/fixtures/src/',
          src: ['**'],
          dest: 'test/fixtures/out/testBaseDir/',
        }
      ]
    },
  };

  config.ver = {
    testSimple: {
      phases: [
        {
          files: ['test/fixtures/out/testSimple/**/*.{js,png}'],
          references: ['test/fixtures/out/testSimple/**/*.css'],
        },
        {
          files: ['test/fixtures/out/testSimple/**/*.css'],
        }
      ],
      versionFile: 'test/fixtures/out/testSimple/version.json',
      forceVersion: 'dev',
    },
    testBaseDir: {
      phases: [
        {
          files: ['test/fixtures/out/testBaseDir/**/*.{js,png}'],
          references: ['test/fixtures/out/testBaseDir/**/*.css'],
        },
        {
          files: ['test/fixtures/out/testBaseDir/**/*.css'],
        }
      ],
      versionFile: 'test/fixtures/out/testBaseDir/version.json',
      baseDir: 'test/fixtures/out',
    },
  };

  config.bump = {
    options: {
      push: false,
    },
  };

  grunt.initConfig(config);

  // Load this tasks's plugins.
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', [
    'jshint',
    'clean',
    'copy',
    'ver',
    'nodeunit', // verify the results of the 'ver' task
  ]);
  grunt.registerTask('publish', [
    'default',
    'clean', // clean up temporary files before publishing
    'bump',
    'exec:publish',
  ]);

};
