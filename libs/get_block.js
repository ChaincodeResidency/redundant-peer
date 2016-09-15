const makeBitcoinCoreRequest = require("./make_bitcoin_core_request");

const methods = require("./../conf/core_rpc_api_methods");

/** Get the block for a hash

  {
    hash: <Block Hash String>
    [json]: <Bool> = false
  }

  @returns via cbk
  <Block Object>
*/
module.exports = (args, cbk) => {
  if (!args.hash) { return cbk([0, "Expected block hash", args]); }

  return makeBitcoinCoreRequest({
    method: methods.get_block,
    params: [args.hash, !!args.json]
  },
  cbk);
};

