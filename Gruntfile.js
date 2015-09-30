'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);

  require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
  });

  var config = {
    lib: 'lib',
    client: 'client',
    server: 'server',
    less: 'public/less',
    css: 'public/css',
    dist: 'public/dist'
  };

  grunt.initConfig({
    config: config,

    clean: {
      prod: ['<%= config.dist %>/**/*'],
      css: ['<%= config.css %>/*.css']
    },

    copy: {
      fonts: {
        expand: true,
        cwd: '<%= config.lib %>/bootstrap/dist/fonts/',
        src: '*',
        dest: '<%= config.dist %>/fonts/',
        flatten: true
      }
    },

    concat: {
      js: {
        src: [
          '<%= config.lib %>/jquery/dist/jquery.min.js',
          '<%= config.lib %>/bootstrap/dist/js/bootstrap.min.js'
        ],
        dest: '<%= config.dist %>/libs.js'
      },
      css: {
        src: [
          '<%= config.lib %>/bootstrap/dist/css/bootstrap.css',
          '<%= config.css %>/app.css'
        ],
        dest: '<%= config.dist %>/main.css'
      }
    },

    watch: {
      server: {
        files: ['<%= config.server %>', '!public/**/*', '!node_modules/**/*', '!<%= config.client %>/**/*', '!Gruntfile.js'],
        tasks: ['jshint:server']
      },
      client: {
        files: ['<%= config.client %>/**/*.js'],
        tasks: ['jshint:client', 'browserify:prod']
      },
      less: {
        files: ['<%= config.less %>/app/*.less'],
        tasks: ['less', 'concat:css']
      }
    },

    jshint: {
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          '<%= config.dist %>/**/*',
          '<%= config.lib %>/**/*',
          'node_modules/**/*'
        ]
      },
      server: {
        src: ['<%= config.server %>/**/*.js', '!public/**/*', '!node_modules/**/*', '!<%= config.client %>/**/*', '!Gruntfile.js']
      },
      client: {
        src: ['<%= config.client %>/**/*.js']
      }
    },

    uglify: {
      dev: {
        options: {
          compress: false,
          mangle: false,
          sourceMap: true
        },
        files: {
          '<%= config.dist %>/main.js': ['<%= config.dist %>/main.js']
        }
      },
      prod: {
        options: {
          compress: true,
          mangle: true
        },
        files: {
          '<%= config.dist %>/main.js': ['<%= config.dist %>/main.js']
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
          '<%= config.css %>/app.css': [
            '<%= config.less %>/app/*.less'
          ]
        }
      }
    },

    browserify: {
      prod: {
        files: {
          '<%= config.dist %>/main.js': ['<%= config.client %>/app.js']
        }
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
    // 'jshint',
    // 'mochaTest',
    'less',
    'concat',
    'copy',
    'browserify:prod',
    'uglify:prod'
  ]);

  grunt.registerTask('default', 'build');
};
