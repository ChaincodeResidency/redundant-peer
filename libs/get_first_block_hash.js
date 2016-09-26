const asyncConst = require("async/constant");
const auto = require("async/auto");
const whilst = require("async/whilst");

const hasLocalCore = require("./has_local_core");
const requestFromCore = require("./make_bitcoin_core_request");
const returnResult = require("./return_result");

const methods = require("./../conf/core_rpc_api_methods");

const blockchainCache = require("./../cache/blockchain_cache");

/** Get the first block's hash

  {
    [max_depth]: <Number>
  }

  @returns via cbk
  <Hash String>

  OR

  null
*/
module.exports = (args, cbk) => {
  return auto({
    hasLocalCore: asyncConst(hasLocalCore({})),

    getCachedFirstHash: ["hasLocalCore", (res, go_on) => {
      if (!!res.hasLocalCore) { return go_on(); }

      let deepest = blockchainCache.best_block_hash;

      return whilst(
        () => {
          if (!deepest) { return false; }

          const deeper = blockchainCache.previous_hashes[deepest];

          return !!deeper && !!blockchainCache.serialized_blocks[deeper];
        },
        (dug) => {
          return dug(null, deepest = blockchainCache.previous_hashes[deepest]);
        },
        () => {
          return go_on(null, deepest);
        }
      );
    }],

    getChainInfo: ["hasLocalCore", (res, go_on) => {
      if (!res.hasLocalCore) { return go_on(); }

      return requestFromCore({method: methods.get_blockchain_info}, go_on);
    }],

    firstHeight: ["getChainInfo", "hasLocalCore", (res, go_on) => {
      if (!res.hasLocalCore) { return go_on(); }

      const currentHeight = res.getChainInfo.blocks;
      const pruneHeight = res.getChainInfo.pruneheight;

      const localHeight = !!pruneHeight ? pruneHeight - 1 : [].length;

      if (!!args.max_depth) {
        const maxDepthHeight = currentHeight - args.max_depth;

        return go_on(null, Math.max(maxDepthHeight, localHeight));
      }

      return go_on(null, localHeight);
    }],

    getHashForFirstHeight: ["firstHeight", "hasLocalCore", (res, go_on) => {
      if (!res.hasLocalCore) { return go_on(); }

      return requestFromCore({
        method: methods.get_block_hash,
        params: [res.firstHeight]
      },
      go_on);
    }],

    firstHash: [
      "getCachedFirstHash",
      "getHashForFirstHeight",
      (res, go_on) =>
    {
      return go_on(null, res.getCachedFirstHash || res.getHashForFirstHeight);
    }]
  },
  returnResult({result: "firstHash"}, cbk));
};

