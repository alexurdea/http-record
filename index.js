// config
var PROXY_PORT = 8000;

var http = require('http');
var ProxyStream = require('./lib/proxy-stream').ProxyStream;
var url = require('url');

var server = http.createServer(function(req, res){
  var cs = new ProxyStream();

  cs
  .on('error', function(){
    console.log('ERR: ', arguments);
  });

  options = url.parse(req.url);

  var httpReq = http.request(options, function(serverRes){
    res.writeHead(serverRes.statusCode, serverRes.headers);

    // avoid pipe when there's no need to intercept
    if (cs.intercept(serverRes)){
      cs.initStorage('./data', req.method, req.url);
      serverRes
      .pipe(cs)
      .pipe(res);
    } else {
      serverRes
      .pipe(res);
    }
  });

  req.pipe(httpReq);
}).listen(PROXY_PORT);