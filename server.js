const bodyParser = require("body-parser");
const checkDependencyVersions = require("walnut").check;
const compress = require("compression")();
const express = require("express");
const logger = require("morgan");
const responseTime = require("response-time");

const hasLocalCore = require("./libs/has_local_core");
const enforceMemoryLimit = require("./libs/enforce_memory_limit");
const pullFromRemotePeers = require("./workers/pull_from_remote_peers");
const pushToRemotePeers = require("./workers/push_to_remote_peers");
const v0 = require("./routes/main");

const appPackage = require("./package");
const configuration = require("./conf/server");

const app = express();
const env = process.env.NODE_ENV;
const port = process.env.PORT || configuration.port;

enforceMemoryLimit({
  check_interval: configuration.memory_check_ms,
  memory_limit: configuration.node_memory_limit,
});

if (!!hasLocalCore({})) {
  const credentials = require("./credentials");

  pullFromRemotePeers({remote_peers: credentials.remote_peers || []});
}

pushToRemotePeers({});

app.listen(port, () => { return console.log("Listening on " + port); });

app.disable("x-powered-by");

app.use(compress);

app.use(bodyParser.json({limit: configuration.max_service_receive_limit}));

app.use(responseTime());

app.use(logger(configuration.log_format));

app.use(`/${configuration.api_version}`, v0);

if (env !== "production") { checkDependencyVersions(appPackage); }

