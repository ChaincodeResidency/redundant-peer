const BitcoinCoreClient = require("bitcoin").Client;

const CREDENTIALS = require("./../credentials");

const client = new BitcoinCoreClient({
  pass: CREDENTIALS.bitcoin_core_rpc_password,
  user: CREDENTIALS.bitcoin_core_rpc_user
});

/** Make a request to the local Bitcoin Core

  {
    method: <Bitcoin Core RPC String>
    [params]: Array<Any>
  }

  @returns via cbk
  <Response Object>
*/
module.exports = (args, cbk) => {
  if (!args.method) { return cbk([0, "Expected method", args]); }

  return client.cmd([{
      method: args.method,
      params: args.params || []
    }],
    function(err, response) {
      if (!!err) { return cbk([500, "Bitcoin Core Data", err]); }

      return cbk(null, response);
    });
};

