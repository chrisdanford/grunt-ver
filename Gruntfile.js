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
        'test/fixtures/out'
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

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'test/fixtures/src/',
            src: ['**'],
            dest: 'test/fixtures/out/'
          }
        ]
      }
    },

    ver: {
      test: {
        phases: [
          {
            files: ['test/fixtures/out/**/*.{js,png}'],
            references: ['test/fixtures/out/**/*.css'],
          },
          {
            files: ['test/fixtures/out/**/*.css'],
          }
        ],
        version: 'test/fixtures/out/version.json',
        forceVersion: 'dev'
      }
    }

  });

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
    'clean' // clean up temporary files
  ]);
  grunt.registerTask('publish', [
    'default',
    'bump',
    'exec:publish',
  ]);

};
