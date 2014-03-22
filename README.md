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

Ports:
  - web-client: 9000 dev server / 7654 for prod server
  - websockets: 8400 for sync with web client - should be 7654, as as prod server
  - proxy port: 8000




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


Architecture
------------

- Controller (lib/controller) inits the proxying.
  It uses:
    - a Record Stream instance
    - Traffic Persist
    - Storage Formatters
  It emits:
    - action names that it executes - like 'start', 'stop', 'restart'
  Usage:
    - used by both index.js (so the command line), and the web client via the Client Sync Manager

- Client Sync Manager (lib/client-sync-manager). Creates a socket and listens for actions which is calls on the Controller,
  from Web Client. The socket will emit 'user-action-complete'.
  It uses:
    - Controller

- Web Client (webclient/) is a web app that accesses the proxy via a web socket, and can send commands to the proxy, change 
  the config, and display recordings
  Usage:
    - can either start it by starting the server manually, or start the recorder in command line with --web-client, which
    starts the server and displays a message on how to access the web client

- Server (lib/server) is an express web server that serves the web client. It's being started by index.js, when NODE_ENV is
  NOT set to "development" (so when NODE_ENV is "development", then you need to start the Grunt dev server). It serves the
  content of /dist
  Usage:
    - start it from with the --web-client command on the command line, when not in a dev environment

- Record Stream (lib/record-stream) - an implementation of a transform stream. You first need to call 'initStorage' on it, to become ready for
  piping
  It uses:
    - Traffic Persist
  Usage:
    - call initStorage on it, to create a record (file on disk etc) that coresponds to the URL and method

- Traffic Persist (lib/traffic-persist) - maps URLs + HTTP method to a path on disk, creates the file, and returns a writable stream
  Usage:
    - always call setBaseDir first, then createPath

- Storage Formatters - responsible with the separator strings that make possible storing and retreaving different request/response
  parts
  

Dev
---
  ```bash
  export NODE_ENV=development
  ./index.js --config=conf/example.conj.json --web-client &
  cd ./web-client
  grunt serve &
  open 127.0.0.1:9000/?syncport=8400 
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
