const bodyParser = require("body-parser");
const checkDependencyVersions = require("walnut").check;
const compress = require("compression")();
const express = require("express");
const logger = require("morgan");
const responseTime = require("response-time");

const hasLocalCore = require("./libs/has_local_core");
const enforceMemoryLimit = require("./libs/enforce_memory_limit");
const printServiceConfiguration = require("./libs/print_service_config");
const pullFromRemotePeers = require("./workers/pull_from_remote_peers");
const pushToRemotePeers = require("./workers/push_to_remote_peers");
const serviceConfiguration = require("./libs/service_configuration");
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

let credentials;

if (!!hasLocalCore({})) {
  credentials = require("./credentials");

  pullFromRemotePeers({remote_peers: credentials.remote_peers || []});
}

const serviceType = serviceConfiguration({
  credentials: credentials,
  service_secret: process.env.REDUNDANT_PEER_SECRET
});

printServiceConfiguration({
  is_light_mode: serviceType.is_light_mode,
  is_missing_secret: serviceType.is_missing_secret,
  polling_count: serviceType.polling_count,
  pushing_count: serviceType.pushing_count
});

pushToRemotePeers({});

app.listen(port, () => { return console.log("Listening on " + port); });

app.disable("x-powered-by");

app.use(compress);

app.use(bodyParser.json({limit: configuration.max_service_receive_limit}));

app.use(responseTime());

app.use(logger(configuration.log_format));

app.use(`/${configuration.api_version}`, v0);

if (env !== "production") { checkDependencyVersions(appPackage); }

