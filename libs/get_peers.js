const makeCoreRequest = require("./make_bitcoin_core_request");

const methods = require("./../conf/core_rpc_api_methods");

/** Get bitcoin core peers

  {}
*/
module.exports = (args, cbk) => {
  return makeCoreRequest({method: methods.get_peer_info}, cbk);
};

  