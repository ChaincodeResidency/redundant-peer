const assertDeepEqual = require("assert").deepEqual;
const assertIsArray = require("assert").isArray;

const _ = require("underscore");
const auto = require("async/auto");
const vows = require("vows");

const libs = "./../../libs/";

const getBestBlockHash = require(libs + "get_best_block_hash");
const getBlock = require(libs + "get_block")
const getNewerBlocks = require(libs + "get_blocks_after_hashes");
const getPrecedingBlockHash = require(libs + "get_preceding_block_hash");

vows
  .describe("Test Get Blocks After Hashes")
  .addBatch({
    "When getting blocks after the most recent block": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getNewerBlocks: ["getBestBlockHash", (res, go_on) => {
            return getNewerBlocks({hashes: [res.getBestBlockHash]}, go_on);
          }]
        },
        this.callback);
      },

      "no blocks are returned": (err, res) => {
        assertDeepEqual(err, null);

        const newerBlocks = res.getNewerBlocks;

        assertDeepEqual(newerBlocks.has_more, false);

        assertDeepEqual(res.getBestBlockHash, newerBlocks.best_block_hash);

        assertDeepEqual(!!newerBlocks.blocks, false);
      }
    },
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

          getNewerBlocks: [
            "getBlockHashB",
            "getBlockHashC",
            (res, go_on) =>
          {
            return getNewerBlocks({
              hashes: [res.getBlockHashC, res.getBlockHashB]
            },
            go_on);
          }]
        },
        this.callback);
      },

      "more current blocks are returned": (err, res) => {
        assertDeepEqual(null, err);

        const blocks = res.getNewerBlocks.blocks;

        assertIsArray(blocks);

        assertDeepEqual(res.getNewerBlocks.has_more, false);

        assertDeepEqual(blocks.length, [res.getBlockHashA].length);

        assertDeepEqual(_(blocks).first(), res.getBlockA);

        return;
      }
    }
  })
  .export(module); // Run it

