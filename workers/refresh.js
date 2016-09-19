const auto = require("async/auto");
const eachSeries = require("async/eachSeries");
const forever = require("async/forever");
const parseLinkHeader = require("parse-link-header");
const request = require("request");

const getBestBlockHash = require("./../libs/get_best_block_hash");
const importBlock = require("./../libs/import_block");
const logError = require("./../libs/log_error");
const makeGetBlocksRequest = require("./../libs/make_get_blocks_request");
const pathForNewerBlocks = require("./../routes/path_for_newer_blocks");
const returnResult = require("./../libs/return_result");

const codes = require("./../conf/http_status_codes");
const server = require("./../conf/server");

/** Pull from a remote redundant peer, importing new blocks as we find them

    When up-to-date, delay for specified interval, then poll again

    When very behind, page until up-to-date

    When on an incorrect chain, find common hash and then get on good chain

  {
    host: <Block Service Host String>
    [path]: <Host Path String>
  }

  @returns via cbk
  <Iterate Request Path String>
*/
module.exports = function(args, cbk) {
  return auto({
    getBestBlockHash: (go_on) => {
      if (!!args.path) { return go_on(); }

      return getBestBlockHash({}, go_on);
    },

    getPath: ["getBestBlockHash", (res, go_on) => {
      if (!!args.path) { return go_on(null, args.path); }

      const blockHash = res.getBestBlockHash;

      if (!blockHash) { return go_on([codes.server_error, "Expected hash"]); }

      return go_on(null, pathForNewerBlocks({after_hash: blockHash}));
    }],

    requestNewerBlocks: ["getPath", (res, go_on) => {
      return makeGetBlocksRequest({host: args.host, path: res.getPath}, go_on);
    }],

    importBlocks: ["requestNewerBlocks", (res, go_on) => {
      if (!res.requestNewerBlocks) {
        return go_on([codes.server_error, "Expected newer blocks response"]);
      }

      if (!res.requestNewerBlocks.blocks) { return go_on(); }

      if (!Array.isArray(res.requestNewerBlocks.blocks)) {
        return go_on([codes.server_error, "Expected blocks array"]);
      }

      return eachSeries(res.requestNewerBlocks.blocks, (block, imported) => {
        return importBlock({block}, imported);
      },
      go_on);
    }],

    iteratePath: ["requestNewerBlocks", (res, go_on) => {
      if (!res.requestNewerBlocks || !res.requestNewerBlocks.iterate_path) {
        return go_on([codes.server_error, "Expected iterate path"]);
      }

      return go_on(null, res.requestNewerBlocks.iterate_path);
    }]
  },
  returnResult({result: "iteratePath"}, cbk));
};

