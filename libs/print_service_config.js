/** Log the service configuration

  {
    is_light_mode: <Bool>
    is_missing_secret: <Bool>
    polling_count: <Hosts to Poll Number>
    pushing_count: <Hosts to Push Number>
  }
*/
module.exports = (args) => {
  const createConfigurationJson = "create ./configuration.json file alongside the ./server.js file with the JSON strings \"bitcoin_core_rpc_password\" and \"bitcoin_core_rpc_user\" set to the RPC authentication values of the local running Bitcoin instance: {\"bitcoin_core_rpc_password\": \"$localRpcPasswordValue\", \"bitcoin_core_rpc_user\": \"$localRpcUserValue\"}";

  console.log("# Service Configuration");

  if (!!args.is_missing_secret) {
    console.log("## Incomplete Configuration!\n");

    console.log(`To connect this service to a local Bitcoin Core instance, ${createConfigurationJson}`);

    console.log("\nor\n");

    console.log("To operate this service as a caching front-end, set the local environment variable REDUNDANT_PEER_SECRET to a secret value and then push Blockchain data to this service from another instance configured with a local Core node. On the other Core enabled service, creating a configuration.json file alongside the server.js with the entry \"cache_peers\" set to an array with an object that contains the \"host\" address of this service and this service's \"secret\" authentication value, {\"cache_peers\": [{\"host\": \"https://url-to-this-service.example.com\", \"secret\": \"$secretAuthenticationValue\"}]");

    return;
  }

  if (!!args.is_light_mode) {
    console.log("Running in light cache mode, with no local Bitcoin Core.");

    console.log("To enable strong validation, ${createConfigurationJson}");

    return;
  }

  if (!args.polling_count && !args.pushing_count) {
    console.log("No remote polling targets found, to poll data from a remote service, add a \"remote_peers\" entry to the configuration.json file with an array of remote instances to poll, like {\"remote_peers\": [\"https://remote-service.example.com\"]}");

    return;
  }

  console.log(`- Polling Blockchain data from ${args.polling_count} nodes, pushing Blockchain data to ${args.pushing_count} nodes`);
};

