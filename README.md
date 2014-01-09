
run:
  nodemon --watch lib/ index.js
  jasmine-node spec/ --verbose --autotest --watch ./lib/ &


---
TODO: Config file:
---

record: {
  profiles: {
    jsonFiles: {
      'content-type': 'application/json',
      host: '*parse.com'
    },
    searchEngine: {
      host: 'google.com',
      responseStatus: 201,
      allowedAge: 60 * 60 * 24 * 30  // 30 days
    },
  },

  directory: './test/replay'
}






---
TODO: commands
---

> use config/replay-config.json
> profiles
> record profiles all
> replay search-engine and record json-files
