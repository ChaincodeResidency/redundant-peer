const _ = require("underscore");
const asyncConstant = require("async/constant");
const map = require("async/map");
const auto = require("async/auto");

const findLaterHashes = require("./find_later_hashes");
const getBestBlockHash = require("./get_best_block_hash");
const getBlock = require("./get_block");
const getFirstBlockHash = require("./get_first_block_hash");
const getPrecedingBlockHash = require("./get_preceding_block_hash");
const returnResult = require("./return_result");

const httpCodes = require("./../conf/http_status_codes");

/** Get blocks that are after hashes

  {
    [catchup_limit]: <Maximum Depth to Search>
    hashes: Array<Block Hash String>
    [limit]: <Maximum Blocks Number>
  }

  @returns via cbk

  // Blocks that came after the hashes listed
  {
    best_block_hash: <Chain Tip Hash String>
    [blocks]: [{serialized_block: <Serialized Block Hex String>}]
    has_more: <More Block Results Bool>
    highest_block_hash: <Most Recent Block Retrieved Hash String>
  }

  OR

  // When all hashes are unknown, pull back + indicate other hashes to try
  [404, {error: {hashes: Array<Hash String>}}]
*/
module.exports = (args, cbk) => {
  return auto({
    validateArguments: (go_on) => {
      if (!Array.isArray(args.hashes)) {
        return go_on([httpCodes.server_error, "Expected array of hashes"]);
      }

      if (!args.hashes.length) {
        return go_on([httpCodes.bad_request, "Expected at least one hash"]);
      }

      if (!!args.limit && !parseInt(args.limit, 10)) {
        return go_on([httpCodes.bad_request, "Expected reasonable limit"]);
      }

      return go_on();
    },

    getBestBlockHash: ["validateArguments", (res, go_on) => {
      return getBestBlockHash({}, go_on);
    }],

    isAlreadyBestHash: ["getBestBlockHash", (res, go_on) => {
      if (!res.getBestBlockHash) {
        return go_on([httpCodes.server_error, "Missing best hash"]);
      }

      return go_on(null, _(args.hashes).contains(res.getBestBlockHash));
    }],

    getFirstBlockHash: ["isAlreadyBestHash", (res, go_on) => {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      return getFirstBlockHash({max_depth: args.catchup_limit}, go_on);
    }],

    getHashesAfterHash: [
      "getBestBlockHash",
      "getFirstBlockHash",
      "isAlreadyBestHash",
      (res, go_on) =>
    {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      return findLaterHashes({
        after: res.getFirstBlockHash,
        before: res.getBestBlockHash,
        hashes: args.hashes
      },
      go_on);
    }],

    hashesWithinLimit: [
      "getHashesAfterHash",
      "isAlreadyBestHash",
      (res, go_on) =>
    {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      const limit = parseInt(args.limit, 10);

      if (!limit) { return go_on(null, res.getHashesAfterHash); }

      return go_on(null, res.getHashesAfterHash.slice(0, limit));
    }],

    highestBlockHash: ["hashesWithinLimit", (res, go_on) => {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      return go_on(null, _(res.hashesWithinLimit).last());
    }],

    getBlocksAfterHash: ["hashesWithinLimit", (res, go_on) => {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      return map(res.hashesWithinLimit, (hash, gotBlock) => {
        return getBlock({hash: hash}, gotBlock);
      },
      go_on);
    }],

    result: [
      "getBlocksAfterHash",
      "getHashesAfterHash",
      "highestBlockHash",
      (res, go_on) =>
    {
      const newerHashes = res.getHashesAfterHash;
      const newerBlocks = _(res.getBlocksAfterHash).compact();

      const hasMore = !!newerHashes && newerHashes.length > newerBlocks.length;

      return go_on(null, {
        best_block_hash: res.getBestBlockHash,
        blocks: res.getBlocksAfterHash,
        has_more: hasMore,
        highest_block_hash: res.highestBlockHash
      });
    }]
  },
  returnResult({result: "result"}, cbk));
};

