const compress = require("compression")();
const express = require("express");
const logger = require("morgan");
const responseTime = require("response-time");
const walnut = require("walnut");

const v0 = require("./routes/main");

const configuration = require("./conf/server");

const app = express();
const env = process.env.NODE_ENV;
const port = process.env.PORT || configuration.port;

app.listen(port, () => { return console.log("Listening on " + port); });

app.disable("x-powered-by");
app.use(compress);
app.use(responseTime());
app.use(logger(configuration.log_format));

app.use("/v0", v0);

if (env !== "production") { walnut.check(require("./package")); }

setInterval(() => {
  const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024);

  // Do not allow this process to exceed memory limit
  if (memoryUsage > NODE_MEMORY_LIMIT) { process.exit(); }
},
configuration.memory_check_ms);

