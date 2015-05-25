'use strict';
/*eslint-env node*/

var path = require('path');

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({
    clean: {
      develop: ['.tmp'],
      dist: ['dist']
    },

    eslint: {
      develop: {
        src: [
          'Gruntfile.js',
          'app/scripts/**/*.js'
        ]
      }
    },

    less: {
      develop: {
        options: {
          paths: ['app/styles']
        },
        files: {
          '.tmp/app.gen/styles/main.css': 'app/styles/main.less'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      develop: {
        src: '.tmp/app.gen/styles/main.css'
      }
    },

    copy: {
      develop: {
        files: [{
          expand: true,
          cwd: 'bower_components',
          src: [
            '*/dist/**/*',
            '!**/*.{js,css}'
          ],
          filter: function (src) {
            var srcpath = src.split(path.sep);
            return srcpath[1] === srcpath[3];
          },
          rename: function (dest, src) {
            var srcpath = src.split(path.sep);
            return path.join('.tmp/app.libs', srcpath.slice(2).join(path.sep));
          }
        }],
        options: {
          timestamp: true
        }
      },

      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/{,*/}*.*'
          ]
        }, {
          expand: true,
          cwd: 'bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: 'dist'
        }, {
          expand: true,
          cwd: '.tmp/app.libs',
          src: '**',
          dest: 'dist'
        }],
        options: {
          timestamp: true
        }
      }
    },

    wiredep: {
      develop: {
        src: 'app/index.html',
        ignorePath: /\.\.\/(dist\/)?/
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp/app.gen'),
              connect.static('app'),
              connect.static('.tmp/app.libs'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              )
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: 'dist'
        }
      }
    },

    watch: {
      options: {
        livereloadOnError: false
      },
      configFiles: {
        files: ['Gruntfile.js'],
        options: {
          reload: true
        }
      },
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['app/scripts/**/*.js'],
        tasks: ['newer:eslint'],
        options: {
          livereload: true
        }
      },
      styles: {
        files: ['app/styles/**/*.less'],
        tasks: ['less:develop', 'autoprefixer:develop'],
        options: {
          livereload: true
        }
      },
      appAssets: {
        files: [
          'app/**/*.{html,js,css}',
          '.tmp/app.gen/**/*.css'
        ],
        options: {
          livereload: true
        }
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: 'dist/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '**/*.svg',
          dest: 'dist/images'
        }]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: 'app/index.html',
      options: {
        staging: '.tmp',
        dest: 'dist',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          'dist/scripts/{,*/}*.js',
          'dist/styles/{,*/}*.css',
          'dist/**/*.{png,jpg,jpeg,gif,webp,svg}',
          'dist/styles/fonts/*'
        ]
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['dist/**/*.html'],
      css: ['dist/styles/{,*/}*.css'],
      options: {
        assetsDirs: [
          'dist',
          'dist/images',
          'dist/styles'
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '**/*.html',
          dest: 'dist'
        }]
      }
    },

    pkg: grunt.file.readJSON('package.json'),

    /*eslint camelcase: [2, {properties: "never"}]*/
    yabs: {
      prerelease: {
        check_git: { branch: ['master'], canPush: true, clean: true },

        bump_versionOnly: { updateConfig: 'pkg', noWrite: true },

        check_version: { branch: ['master'], cmpVersion: 'gt' }
      },

      release: {
        bump_updateManifests: { manifests: ['package.json', 'bower.json'], updateConfig: false },

        commit: { add: ['.'], addKnown: true },

        tag: { name: '{%= version %}' },

        push: { tags: true, useFollowTags: true }
      }
    }
  });

  grunt.registerTask('serve', 'Start the app with livereload. Use serve:dist to serve the build.', function (target) {

    if (target === 'dist') {
      return grunt.task.run([
        'build',
        'connect:dist:keepalive'
      ]);
    } else {
      grunt.task.run([
        'build:develop',
        'connect:livereload',
        'watch'
      ]);
    }
  });

  grunt.registerTask('build', 'Prepare distribution files from sources in app folder', function (phase) {
    grunt.task.run([
      'clean:develop',
      'eslint:develop',
      'less:develop',
      'autoprefixer:develop',
      'copy:develop',
      'wiredep'
    ]);

    if (phase !== 'develop') {
      grunt.task.run([
        'clean:dist',
        'useminPrepare',
        'concat',
        'copy:dist',
        'imagemin',
        'svgmin',
        'cssmin',
        'ngAnnotate',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin'
      ]);
    }
  });

  grunt.registerTask('release', 'Makes next release. Use release:minor or release:major if needed.' +
    ' See semver for all supported increment modes.', function (pIncrement) {
    var increment = pIncrement || 'patch';
    grunt.task.run([
      'yabs:prerelease:' + increment,
      'build',
      'yabs:release:' + increment
    ]);
  });

  grunt.registerTask('default', [
    'build'
  ]);
};
