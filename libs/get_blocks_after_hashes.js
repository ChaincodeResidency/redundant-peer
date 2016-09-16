const _ = require("underscore");
const asyncMap = require("async/map");
const auto = require("async/auto");
const until = require("async/until");

const getBestBlockHash = require("./get_best_block_hash");
const getBlock = require("./get_block");
const getPrecedingBlockHash = require("./get_preceding_block_hash");
const returnResult = require("./return_result");

const codes = require("./../conf/http_status_codes");

/** Get blocks that are after hashes

  FIXME: - server error: no hash and the last hash isn't genesis
  FIXME: - user error: no hash match found

  {
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
  [404, {hashes: Array<Hash String>}]

  OR

  // When the client is too out of date and the server can't handle it, 500
  [500, {max_depth_supported: <Max Old Blocks Supported Int>}]
*/
module.exports = (args, cbk) => {
  return auto({
    validateArguments: (go_on) => {
      if (!Array.isArray(args.hashes)) {
        return go_on([500, "Expected array of hashes"]);
      }

      if (!args.hashes.length) {
        return go_on([400, "Expected at least one hash"]);
      }

      return go_on();
    },

    getBestBlockHash: ["validateArguments", (res, go_on) => {
      return getBestBlockHash({}, go_on);
    }],

    isAlreadyBestHash: ["getBestBlockHash", (res, go_on) => {
      if (!res.getBestBlockHash) { return go_on([500, "Missing best hash"]); }

      return go_on(null, _(args.hashes).contains(res.getBestBlockHash));
    }],

    getHashesAfterHash: [
      "getBestBlockHash",
      "isAlreadyBestHash",
      (res, go_on) =>
    {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      let gotAllHashesAfterHash = false;
      let moreRecentHashes = [res.getBestBlockHash];

      until(
        () => {
          return gotAllHashesAfterHash;
        },
        (gotHash) => {
          return getPrecedingBlockHash({
            hash: _(moreRecentHashes).last()
          },
          (err, hash) => {
            if (!!err) { return gotHash(err); }

            if (!hash) {
              return gotHash([codes.server_error, "Expected hash"]);
            }

            if (_(args.hashes).contains(hash)) {
              return gotHash(null, gotAllHashesAfterHash = true);
            }

            moreRecentHashes.push(hash);

            return gotHash();
          });
        },
        (err) => {
          if (!!err) { return go_on(err); }

          return go_on(null, moreRecentHashes.reverse());
        });
    }],

    hashesWithinLimit: [
      "getHashesAfterHash",
      "isAlreadyBestHash",
      (res, go_on) =>
    {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      return go_on(null, res.getHashesAfterHash.slice(0, args.limit));
    }],

    highestBlockHash: ["hashesWithinLimit", (res, go_on) => {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      return go_on(null, _(res.hashesWithinLimit).last());
    }],

    getBlocksAfterHash: ["hashesWithinLimit", (res, go_on) => {
      if (!!res.isAlreadyBestHash) { return go_on(); }

      return asyncMap(res.hashesWithinLimit, (hash, gotBlock) => {
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
      const newerBlocks = res.getBlocksAfterHash;

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

