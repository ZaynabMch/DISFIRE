const http = require('http')
const httpProxy = require('http-proxy')
const express = require('express')
const responseTime = require('response-time')
const app = express()

app.use(responseTime())

// Start en HTTP proxy på port 8080 som peger på port 8000
// Link: https://www.npmjs.com/package/http-proxy
const proxy = httpProxy.createServer({
  target: {
    host: 'localhost',
    port: 8000
  }
}).listen(8080, () => {
  console.log('HTTP proxy server listening on port 8080')
})

// Start tre HTTP servere
const server1 = http.createServer(app).listen(4000, () => {
  console.log('Express HTTP server listening on port %d', server1.address().port)
})

const server2 = http.createServer(app).listen(4001, () => {
  console.log('Express HTTP server listening on port %d', server2.address().port)
})

const server3 = http.createServer(app).listen(4002, () => {
  console.log('Express HTTP server listening on port %d', server3.address().port)
}) 

// Array med serveradresser
var addresses = [
  {
    host: 'localhost',
    port: server1.address().port,
    protocol: 'http'
  },
  {
    host: 'localhost',
    port: server2.address().port,
    protocol: 'http'
  },
  {
    host: 'localhost',
    port: server3.address().port,
    protocol: 'http'
  }
]

// Round robin load balancer
const balancer = http.createServer( (req, res) => {
  var target = { target: addresses.shift() }
  console.log('Load balancing request to:', target)
  proxy.web(req, res, { target: target['target']['protocol'] + '://' + target['target']['host'] + ':' + target['target']['port'], changeOrigin: true},  function(e) { console.log(e) })
  addresses.push(target.target)
}).listen(8000, () => {
  console.log('Load balancer running at port %d', balancer.address().port)
})

// Express route
app.get("/", (req, res) => {
  res.send("Hello World from server running on port " + req.socket.localPort)
})

// endpoint med matematisk udregning
app.get("/api/:n", (req, res) => {
  let n = parseInt(req.params.n);
  let count = 0;

  if (n > 5000000000) n = 5000000000;

  for (let i = 0; i <= n; i++) {
    count += i;
  }

  res.send(`Final count is ${count} by server running on port ${req.socket.localPort} and check the response time in the header X-Response-Time`);
})


// start applikationsprocessen med pm2
// pm2 start proxy-server.js


// curl requests
// link: https://curl.se/docs/manual.html
// Udregningen af tallet påvirker responstiden

// curl http://localhost:8080
// curl http://localhost:8080/api/5000000000


// -i flag viser header information og -v flag viser mere information
// curl -i http://localhost:8080/api/5000000 
// curl -v http://localhost:8080/api/5000000


// Link: http://localhost:8080
// Link: http://localhost:8080/api/5000000000


// loadtest
// npm install -g loadtest
// link: https://www.npmjs.com/package/loadtest

// loadtest http://localhost:8080/api/500 -n 10 -c 100

// se selv loadtest dokumentationen for flere muligheder
// loadtest --help
// loadtest http://localhost:8080/api/500 -n 1000 -c 100
// loadtest http://localhost:8080/api/500 -n 10000 -c 200
// loadtest http://localhost:8080/api/500 -n 10000 -c 500