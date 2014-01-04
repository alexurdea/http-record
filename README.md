HTTP get /hello?lalala=1
  type=json
HTTPS post /hello
  user=me
  password=somepass

gzip -> plain text
get headers

use a simple database - url -> code, header file id, body file id

transparently follow redirects


run:
  nodemon --watch lib/ index.js
  jasmine-node spec/ --autotest --watch ./lib/ &


---
Config file:
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
commands
---

> use config/replay-config.json
> profiles
> record profiles all
> replay search-engine and record json-files
