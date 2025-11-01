const express = require('express');
const responseTime = require('response-time');
const app = express();

app.use(responseTime());

app.get("/", (req, res) => {
  res.send(`Hello from PM2 cluster process ${process.pid}`);
});

app.get("/api/:n", (req, res) => {
  let n = parseInt(req.params.n);
  if (n > 5000000000) n = 5000000000;
  let count = 0;
  for (let i = 0; i <= n; i++) count += i;
  res.send(`Final count is ${count} from process ${process.pid}`);
});

// 🚀 Gør porten unik per instans:
const basePort = 7000;
const instance = process.env.NODE_APP_INSTANCE || 0;
const PORT = basePort + parseInt(instance);

app.listen(PORT, () => {
  console.log(`Process ${process.pid} listening on port ${PORT}`);
});
