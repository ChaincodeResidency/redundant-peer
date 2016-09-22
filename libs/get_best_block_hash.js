const asyncConst = require("async/constant");
const auto = require("async/auto");

const hasLocalCore = require("./has_local_core");
const makeBitcoinCoreRequest = require("./make_bitcoin_core_request");
const returnResult = require("./return_result");

const codes = require("./../conf/http_status_codes");
const methods = require("./../conf/core_rpc_api_methods");

const blockchainCache = require("./../cache/blockchain_cache");

/** Get the current best block hash

  {}

  @returns via cbk
  <Hash String>
*/
module.exports = (args, cbk) => {
  return auto({
    hasLocalCore: asyncConst(hasLocalCore({})),

    getCachedHash: ["hasLocalCore", (res, go_on) => {
      if (!!res.hasLocalCore) { return go_on(); }

      const bestHash = blockchainCache.best_block_hash;

      if (!bestHash) { return go_on([codes.server_error, "No best hash"]); }

      return go_on(null, blockchainCache.best_block_hash);
    }],

    getCoreHash: ["hasLocalCore", (res, go_on) => {
      if (!res.hasLocalCore) { return go_on(); }

      return makeBitcoinCoreRequest({
        method: methods.get_best_block_hash
      },
      go_on);
    }],

    bestHash: ["getCachedHash", "getCoreHash", (res, go_on) => {
      return go_on(null, res.getCachedHash || res.getCoreHash);
    }]
  },
  returnResult({result: "bestHash"}, cbk));
};

