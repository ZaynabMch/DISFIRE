const http = require('http');
const httpProxy = require('http-proxy');
const express = require('express');
const responseTime = require('response-time');

const app = express();
app.use(responseTime());

const proxy = httpProxy.createProxyServer({});
const servers = [4000, 4001, 4002];
let i = 0;

// Round robin balancer
const balancer = http.createServer((req, res) => {
  const target = `http://localhost:${servers[i]}`;
  i = (i + 1) % servers.length;
  console.log(`Proxying request to ${target}`);
  proxy.web(req, res, { target });
});

balancer.listen(8080, () => {
  console.log("Load balancer running on port 8080");
});

// tre bagvedliggende servere
servers.forEach(port => {
  const instance = express();
  instance.use(responseTime());

  instance.get("/", (req, res) => {
    res.send(`Hello from server on port ${port}`);
  });

  instance.get("/api/:n", (req, res) => {
    let n = parseInt(req.params.n);
    if (n > 5000000000) n = 5000000000;
    let count = 0;
    for (let i = 0; i <= n; i++) count += i;
    res.send(`Count is ${count} (served by ${port})`);
  });

  instance.listen(port, () => console.log(`Server running on port ${port}`));
});
