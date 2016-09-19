const auto = require("async/auto");

const requestFromCore = require("./make_bitcoin_core_request");
const returnResult = require("./return_result");

const methods = require("./../conf/core_rpc_api_methods");

/** Get the first block's hash

  {
    [max_depth]: <Number>
  }

  @returns via cbk
  <Hash String>
*/
module.exports = (args, cbk) => {
  return auto({
    getChainInfo: (go_on) => {
      return requestFromCore({method: methods.get_blockchain_info}, go_on);
    },

    firstHeight: ["getChainInfo", (res, go_on) => {
      const currentHeight = res.getChainInfo.blocks;
      const localHeight = res.getChainInfo.pruneheight || [].length;

      if (!!args.max_depth) {
        const maxDepthHeight = currentHeight - args.max_depth;

        return go_on(null, Math.max(maxDepthHeight, localHeight));
      }

      return go_on(null, localHeight);
    }],

    getHashForFirstHeight: ["firstHeight", (res, go_on) => {
      return requestFromCore({
        method: methods.get_block_hash,
        params: [res.firstHeight]
      },
      go_on);
    }]
  },
  returnResult({result: "getHashForFirstHeight"}, cbk));
};

