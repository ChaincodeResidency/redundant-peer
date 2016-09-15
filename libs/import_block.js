const coreRequest = require("./make_bitcoin_core_request");

const method = require("./../conf/core_rpc_api_methods");

/** Import a new block into the local blockchain

  {
    block: <Hex String>
  }
*/
module.exports = (args, cbk) => {
  return coreRequest({method: method.submit_block, params: [args.block]}, cbk);
};

