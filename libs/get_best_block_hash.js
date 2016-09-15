const makeBitcoinCoreRequest = require("./make_bitcoin_core_request");

const methods = require("./../conf/core_rpc_api_methods");

/** Get the current best block hash

  {}

  @returns via cbk
  <Hash String>
*/
module.exports = (args, cbk) => {
  return makeBitcoinCoreRequest({method: methods.get_best_block_hash}, cbk);
};

