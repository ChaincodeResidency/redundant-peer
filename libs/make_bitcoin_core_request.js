const BitcoinCoreClient = require("bitcoin").Client;

const credentials = require("./../credentials");

const codes = require("./../conf/http_status_codes");

const client = new BitcoinCoreClient({
  pass: credentials.bitcoin_core_rpc_password,
  user: credentials.bitcoin_core_rpc_user
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

  const method = args.method;
  const params = args.params || [];

  return client.cmd([{method, params}], (err, response) => {
      if (!!err) {
        return cbk([
          codes.server_error,
          "Bitcoin Core Data",
          {code: err.code, message: err.message}
        ]);
      }

      return cbk(null, response);
    });
};

