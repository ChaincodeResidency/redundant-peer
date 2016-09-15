const assert = require("assert");

const _ = require("underscore");
const auto = require("async/auto");
const vows = require("vows");

const libs = "./../../libs/";

const getBestBlockHash = require(libs + "get_best_block_hash");
const getBlock = require(libs + "get_block")
const getBlocksAfterHashes = require(libs + "get_blocks_after_hashes");
const getPrecedingBlockHash = require(libs + "get_preceding_block_hash");

vows
  .describe("Test Get Blocks After Hashes")
  .addBatch({
    "When getting the blocks after hashes": {
      topic: function() {
        return auto({
          getBlockHashA: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getBlockA: ["getBlockHashA", (res, go_on) => {
            return getBlock({hash: res.getBlockHashA}, go_on);
          }],

          getBlockHashB: ["getBlockHashA", (res, go_on) => {
            return getPrecedingBlockHash({hash: res.getBlockHashA}, go_on);
          }],

          getBlockHashC: ["getBlockHashB", (res, go_on) => {
            return getPrecedingBlockHash({hash: res.getBlockHashB}, go_on);
          }],

          getBlocksAfterHashes: [
            "getBlockHashB",
            "getBlockHashC",
            (res, go_on) =>
          {
            return getBlocksAfterHashes({
              hashes: [res.getBlockHashC, res.getBlockHashB]
            },
            go_on);
          }]
        },
        this.callback);
      },

      "more current blocks are returned": (err, res) => {
        assert.deepEqual(null, err);

        const blocks = res.getBlocksAfterHashes;

        assert.isArray(blocks);

        assert.deepEqual(blocks.length, [res.getBlockHashA].length);

        assert.deepEqual(_(blocks).first(), res.getBlockA);

        return;
      }
    }
  })
  .export(module); // Run it
