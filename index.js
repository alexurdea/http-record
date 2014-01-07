// config
var PROXY_PORT = 8000;

var http = require('http');
var ProxyStream = require('./lib/proxy-stream').ProxyStream;
var url = require('url');

var server = http.createServer(function(req, res){
  var proxyStream = new ProxyStream();

  proxyStream.on('error', function(){
    console.error('ERR: ', arguments);
  });

  options = url.parse(req.url);

  var httpReq = http.request(options, function(serverRes){
    res.writeHead(serverRes.statusCode, serverRes.headers);

    // avoid pipe when there's no need to intercept
    if (proxyStream.intercept(serverRes)){
      proxyStream.initStorage('./data', req.method, req.url).then(function(){
        serverRes
        .pipe(proxyStream)
        .pipe(res);
      });
    } else {
      serverRes
      .pipe(res);
    }
  });

  req.pipe(httpReq);
}).listen(PROXY_PORT);