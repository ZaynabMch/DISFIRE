const cluster = require('cluster');
const os = require('os');
const process = require('process');
const express = require('express');
const responseTime = require('response-time');

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${numCPUs}`);
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, forking a new one`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(responseTime());

  app.get("/", (req, res) => {
    res.send(`Hello World from worker ${process.pid}`);
  });

  app.get("/api/:n", (req, res) => {
    let n = parseInt(req.params.n);
    if (n > 5000000000) n = 5000000000;
    let count = 0;
    for (let i = 0; i <= n; i++) count += i;
    res.send(`Worker ${process.pid} finished. Final count: ${count}`);
  });

  const server = app.listen(6000, () => {
    console.log(`Worker ${process.pid} listening on port ${server.address().port}`);
  });
}
