const auto = require("async/auto");

const coreRequest = require("./make_bitcoin_core_request");
const hasLocalCore = require("./has_local_core");
const returnResult = require("./return_result");
const setCachedBlock = require("./set_cached_block");

const codes = require("./../conf/http_status_codes");
const method = require("./../conf/core_rpc_api_methods");

/** Import a new block into the local blockchain

  {
    block: <Hex String>
  }
*/
module.exports = (args, cbk) => {
  return auto({
    confirmHasLocalCore: (go_on) => {
      if (!hasLocalCore({})) {
        return go_on([codes.not_implemented, "Expected local Core"]);
      }

      return go_on();
    },

    importToCore: ["confirmHasLocalCore", (res, go_on) => {
      return coreRequest({
        method: method.submit_block,
        params: [args.block]
      },
      go_on);
    }],

    setCachedBlock: ["importToCore", (res, go_on) => {
      return setCachedBlock({block: args.block}, go_on);
    }]
  },
  returnResult({no_content: true}, cbk));
};

