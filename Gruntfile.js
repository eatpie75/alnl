'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required grunt tasks
  require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
  });

  // Configurable paths
  var config = {
    js: 'public/js',
    lib: 'public/lib',
    less: 'public/less',
    dist: 'public/dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    clean: {
      css: ['<%= config.dist %>/*.css'],
      js: ['<%= config.dist %>/*.js'],
      // less: ['<%= config.dist %>/*.less'],
    },

    concat: {
      lib: {
        src: ['<%= config.lib %>/jquery/dist/jquery.min.js', '<%= config.lib %>/hogan/web/builds/3.0.2/hogan-3.0.2.min.js'],
        dest: '<%= config.dist %>/libs.js'
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      server: {
        files: ['**/*.js', '!public/**/*.js', '!node_modules/**/*.js'],
        tasks: ['jshint:server']
      },
      client: {
        files: ['public/**/*.js', '!<%= config.lib %>/**/*.js', '!<%= config.dist %>/*.js'],
        tasks: ['jshint:client', 'uglify:dev']
      },
      less: {
        files: ['<%= config.less %>/*.less'],
        tasks: ['less']
      }
    },

    jshint: {
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          '<%= config.dist %>/**/*.js',
          '<%= config.lib %>/**/*.js',
          'node_modules/**/*.js'
        ]
      },
      server: {
        src: ['**/*.js', '!public/**/.js', '!node_modules/**/*.js']
      },
      client: {
        src: ['public/**/*.js', '!<%= config.lib %>/**/*.js', '!<%= config.dist %>/*.js'],
      }
    },

    uglify: {
      dev: {
        options: {
          compress: false,
          mangle:false
        },
        files: {
          '<%= config.dist %>/app.js': ['<%= config.js %>/app.js']
        }
      },
      prod: {
        options: {
          compress: true,
          mangle:true
        },
        files: {
          '<%= config.dist %>/app.js': ['<%= config.js %>/app.js']
        }
      }
    },

    mochaTest: {
      all: {
        src: ['test/*.js']
      }
    },

    less: {
      dev: {
        files: {
          '<%= config.dist %>/app.css': ['<%= config.less %>/*.less']
        }
      }
    },

    nodemon: {
      local: {
        script: 'bin/www'
      }
    }
  });

  grunt.registerTask('local', function() {
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run(['watch']);
  });

  grunt.registerTask('build', [
    'clean',
    'jshint',
    'mochaTest',
    'less',
    'concat:lib',
    'uglify:prod'
  ]);

  grunt.registerTask('default', 'build');
};
