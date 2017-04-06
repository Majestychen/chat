module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    uglify: {
      options: {
        mangle: true // 允许模糊变量名字
      },
      my_target: {
        files: {
          'build/bundle.min.js': ['build/bundle.js']
        }
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'js/lib/jquery-1.12.4.js',
          'js/lib/jquery.cookie.js',
          'js/lib/autosize.js',
          'js/lib/socket.io.js',
          'js/common.js',
          'js/emotion.js',
          'js/jqSelection.js',
          'js/index.js'
        ],
        dest: 'build/bundle.js',
      }
    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'build/all.css': [
            'css/normalize.css',
            'css/iconfont.css',
            'css/chat_dialog.css',
            'css/index.css'
          ]
        }
      }
    },

    copy: {
      main: {
        expand: true,
        cwd: 'css/',
        src: [
          '*.eot',
          '*.svg',
          '*.ttf',
          '*.woff'
        ],
        dest: 'build/',
      }
    },
  });

  function createIndexHtml() {
    var fs = require("fs");
    var path = require("path");
    var done = this.async();

    var indexPathDev = path.resolve(__dirname, "index_dev.html");
    var indexPath = path.resolve(__dirname, "index.html");
    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(path.resolve(__dirname, "index.html"));
      console.log("== delete index.html ==");
    }


    fs.readFile(indexPathDev, function(err, data) {
      if (err) throw err;
      data = data.toString().replace(/<script[\s\S]*\/script>/i, '<script src="build/bundle.min.js"></script>');
      data = data.replace(/<link[\s\S]*\/link>/i, '<link rel="stylesheet" type="text/css" href="build/all.css"></link>');
      fs.writeFile(indexPath, data, 'utf8', function(err) {
        if (err) {
          console.error(err)
        }
        console.log("== create index.html ==");
        done();
      })
    })

  }

  // 加载包含 "uglify" 任务的插件。
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // 加载包含 "concat" 任务的插件。
  grunt.loadNpmTasks('grunt-contrib-concat');

  // css - min
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.loadNpmTasks('grunt-contrib-copy');

  // 自定义任务
  grunt.registerTask('createIndexHtml', createIndexHtml);

  // 默认被执行的任务列表。
  grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'copy', 'createIndexHtml']);

};