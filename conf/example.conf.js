config = {
  record: {
    proxyPort: 8000,
    destinationDir: './data',
    profiles: {
      jsonFiles: {
        replace: true,
        methods: ['get', 'post'],
        url: '*parse.com',
        headers: {
          'content-type': 'application/json',
        }
      },
      searchEngine: {
        replace: false,
        url: 'google.com',
        responseStatus: 201,
        allowedAge: 60 * 60 * 24 * 30  // 30 days
      },
      html: {
        record: false,
        headers: {
          'content-type': 'text/html'
        }
      }
    },
  },

  replay: {
    /*
     * When noProxy is true, then only serve recordings, and put out an
     * error when something cannot be found.
     */
    noProxy: true,
    profiles: []
  }
};

module.exports = config;