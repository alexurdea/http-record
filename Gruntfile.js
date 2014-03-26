'use strict';

module.exports = function(grunt){
  grunt.initConfig({
    crtDir: __dirname, 

    watch: {
      test: {
        files: [
          '<%=crtDir%>/lib/**/*.js',
          '<%=crtDir%>/spec/**/*.js'
        ],
        tasks: ['shell:test']
      }
    },

    shell: {
      test: {
        options: {
          stdout: true
        },
        command: 'jasmine-node --verbose spec/'
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
};