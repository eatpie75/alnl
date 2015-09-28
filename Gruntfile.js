'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);

  require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
  });

  var config = {
    coffee: 'public/coffee',
    js: 'public/js',
    lib: 'lib',
    less: 'public/less',
    dist: 'public/dist'
  };

  grunt.initConfig({
    config: config,

    clean: {
      css: ['<%= config.dist %>/*.css'],
      js: ['<%= config.dist %>/*.js'],
      fonts: ['<%= config.dist %>/fonts']
      // less: ['<%= config.dist %>/*.less'],
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
          '<%= config.lib %>/hogan/web/builds/3.0.2/hogan-3.0.2.min.js',
          '<%= config.lib %>/markdown-it/dist/markdown-it.min.js',
          '<%= config.lib %>/bootstrap/dist/js/bootstrap.min.js'
        ],
        dest: '<%= config.dist %>/libs.js'
      },
      less: {
        src: [
          '<%= config.lib %>/bootstrap/dist/css/bootstrap.min.css',
          '<%= config.dist %>/app.css'
        ],
        dest: '<%= config.dist %>/main.css'
      }
    },

    watch: {
      server: {
        files: ['**/*.js', '!public/**/*.js', '!node_modules/**/*.js'],
        tasks: ['jshint:server']
      },
      coffee: {
        files: ['<%= config.coffee %>/*.coffee'],
        tasks: ['coffee:dev']
      },
      client: {
        files: ['<%= config.js %>/*.js'],
        tasks: [/*'jshint:client',*/ 'uglify:dev']
      },
      less: {
        files: ['<%= config.less %>/app/*.less'],
        tasks: ['less', 'concat:less']
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
        src: ['**/*.js', '!public/**/*.js', '!node_modules/**/*.js']
      },
      client: {
        src: ['<%= config.js %>/*.js', '!<%= config.js %>/markdown-it-thingtag.js', '!<%= config.lib %>/**/*.js', '!<%= config.dist %>/*.js']
      }
    },

    uglify: {
      dev: {
        options: {
          compress: false,
          mangle: false
        },
        files: [{
            expand: true,
            cwd: '<%= config.js %>',
            src: '**/*.js',
            dest: '<%= config.dist %>'
        }]
      },
      prod: {
        options: {
          compress: true,
          mangle: true
        },
        files: {
          '<%= config.dist %>/main.js': ['<%= config.js %>/*.js']
        }
      }
    },

    mochaTest: {
      all: {
        src: ['test/*.js']
      }
    },

    coffee: {
      dev: {
        files: [{
          expand: true,
          cwd: '<%= config.coffee %>',
          src: '*.coffee',
          dest: '<%= config.js %>',
          ext: '.js'
        }]
      }
    },

    less: {
      dev: {
        files: {
          '<%= config.dist %>/app.css': [
            '<%= config.less %>/app/*.less'
          ]
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
    'coffee',
    // 'jshint',
    'mochaTest',
    'less',
    'concat',
    'copy',
    'uglify:prod'
  ]);

  grunt.registerTask('default', 'build');
};
