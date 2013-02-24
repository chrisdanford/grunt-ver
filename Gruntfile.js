module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
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
        es5: true,
        strict: false,
        globals: {},
      },
      app: [
        'Gruntfile.js',
        'tasks/*.js',
        'test/*.js'
      ]
    },

    clean: {
      test: [
        'test/fixtures/processed'
      ]
    },

    nodeunit: {
      files: [
        'test/*.js'
      ]
    },

    exec: {
      publish: {
        command: 'npm publish .',
      }
    },

    ver: {
      test: {
        phases: [
          {
            files: ['test/fixtures/processed/**/*.{js,png}'],
            references: ['test/fixtures/processed/**/*.css'],
          },
          {
            files: ['test/fixtures/processed/**/*.css'],
          }
        ],
        version: 'test/fixtures/processed/version.json',
        forceVersion: 'dev'
      }
    }

  });

  // Load this tasks's plugins.
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', [
    'jshint',
    'ver',
    'clean',
    'nodeunit',
    'clean' // clean after so that temporary files don't hang around
  ]);
  grunt.registerTask('publish', [
    'default',
    'bump',
    'exec:publish',
  ]);

};
