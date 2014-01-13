*In development!* It has not been published as a package yet, and the features in this README are being developed.

HTTP-Record
===========

Record and replay HTTP traffic in a simple and intuitive 
way. All traffic (including headers) is saved in text files and can be 
editted. You can record and replay at the same time, or separately.


Usage
-----

Install:
  ```bash
  npm install -g http-record
  ```

Record and replay at the same time:
  ```bash
  http-record --record --replay --config=./config/example.conf.js
  ```

Just replay:
  ```bash
  http-record --replay --config=./config/example.conf.js
  ```

Of course, you can just record with just the `--record` option. You can then go 
to the recordings directory, and edit the files before replaying them.


Config
------

The config will be read from a file. Start http-record with the `--config` option
pointing to that file.

### TODO: add `config.destinationDir` to example config
Store all traffic to this directory.

### `record.proxyPort`
Defaults to 8000.

### `record.destinationDir`
Save all traffic inside this directory. Relative to the index.js script.

### `record.profiles`
An array of profiles. A profile is agroup of filtering conditions, with a name. You
can then use these to tell the proxy which URLs to replay.

A profile contains a set of matching rules (a filter), and instructions on how to manipulate
the file for storage, once a request matches *all* those rules.

### `profile.replace`
+ `true`: When a newer request is made, replace the existing stored recording with the new one.
+ `false`: ignore newer requests once something has been stored.

### `profile.methods`
An array of strings - contains any valid HTTP verbs.

### `profile.url`
The request URL.

### `profile.headers`
Object containing headers in key-value form. If all these match, the request is filtered
for storage.

### `profile.responseStatus`
100 - 599 valid HTTP response codes.


### `replay.noProxy`
Only when in record mode - do not create any requests to intended hosts, just serve from
storage. If a recording is not available, write out a warning to stderr.



Dev
---
  ```bash
  # run
  nodemon --watch lib/ index.js
  # watch & test
  jasmine-node spec/ --verbose --autotest --watch ./lib/ &
  # or
  jasmine-node --verbose spec/traffic-persist-spec.js; jasmine-node --verbose spec/proxy-stream-spec.js
  ```


---
TODO: rename proxy-stream to record-stream
TODO: Config file - see config/example.config.js
---



---
TODO: commands
---

> use config/replay-config.json
> profiles
> record profiles all
> replay search-engine and record json-files
