const cluster = require('cluster')
const os = require('os')
const process = require('process')
const express = require('express');
const responseTime = require('response-time')

// se antallet af CPU cores på Mac ved at skrive følgende kommando i Terminalen
// sysctl -n hw.ncpu
// eller antallet af CPU cores på Windows
// wmic cpu get NumberOfCores, NumberOfLogicalProcessors
const numCPUs = os.cpus().length;
// console.log(numCPUs)

// Cluster modulet giver os muligheder for at lave flere instanser af vores Node.js applikation
// som kan dele arbejdsbyrden mellem workers på samme port

// Link: https://nodejs.org/api/cluster.html

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${numCPUs}`);
  console.log(`Primary ${process.pid} is running`);

  // Flere workers på hver sin mulige CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app = express();
  app.use(responseTime())
  console.log(`Worker ${process.pid} started`);
 
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // endpoint med matematisk udregning
  app.get("/api/:n", (req, res) => {
    let n = parseInt(req.params.n);
    let count = 0;
 
    if (n > 5000000000) n = 5000000000;
 
    for (let i = 0; i <= n; i++) {
      count += i;
    }
 
    res.send(`Final count is ${count} and check the response time in the header X-Response-Time`);
  });

  const server = app.listen(6000, () => {
    console.log('Listening on port %d', server.address().port)
  });
}

// start applikationsprocessen med pm2
// pm2 start node-cluster-server.js


// curl requests
// Link: https://curl.se/docs/manual.html
// Udregningen af tallet påvirker responstiden

// -i flag viser header information og -v flag viser mere information
// curl -v http://localhost:6000/api/5000000000
// curl -i http://localhost:6000/api/5000000000


// loadtest
// npm install -g loadtest
// Link: https://www.npmjs.com/package/loadtest

// loadtest http://localhost:6000/api/500 -n 10 -c 100

// se selv loadtest dokumentationen for flere muligheder
// loadtest --help
// loadtest http://localhost:6000/api/500 -n 1000 -c 100
// loadtest http://localhost:6000/api/500 -n 10000 -c 200
// loadtest http://localhost:6000/api/500 -n 10000 -c 500