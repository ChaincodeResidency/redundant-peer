const makeBitcoinCoreRequest = require("./make_bitcoin_core_request");

/** Get the current best block hash

  {}

  @returns via cbk
  <Hash String>
*/
module.exports = (args, cbk) => {
  return makeBitcoinCoreRequest({method: "getbestblockhash"}, cbk);
};

