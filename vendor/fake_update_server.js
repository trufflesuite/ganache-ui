var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static-throttle')
var path = require('path')

// Serve up public/ftp folder
var serve = serveStatic(path.resolve(`${__dirname}/../release`), {
  throttle: 30
})

// Create server
var server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
})

// Listen
server.listen(8000)
