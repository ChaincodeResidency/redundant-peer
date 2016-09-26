const assertDeepEqual = require("assert").deepEqual;
const assertIsArray = require("assert").isArray;
const assertIsNumber = require("assert").isNumber;
const assertIsUndefined = require("assert").isUndefined;

const _ = require("underscore");
const auto = require("async/auto");
const vows = require("vows");

const libs = "./../../libs/";

const getBestBlockHash = require(libs + "get_best_block_hash");
const getBlock = require(libs + "get_block")
const getNewerBlocks = require(libs + "get_newer_blocks");
const getPrecedingBlockHash = require(libs + "get_preceding_block_hash");

const httpCodes = require("./../../conf/http_status_codes");

vows
  .describe("Test Get Newer Blocks")
  .addBatch({
    "When getting blocks after a hash that doesn't exist": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getNewerBlocks: ["getBestBlockHash", (res, go_on) => {
            const fakeHash = res.getBestBlockHash.replace(/[abcde]/, "f");

            return getNewerBlocks({
              catchup_limit: [fakeHash].length,
              hashes: [fakeHash],
            },
            go_on);
          }]
        },
        this.callback);
      },

      "suggestion hashes are returned": (err, res) => {
        assertIsArray(err);

        assertDeepEqual(err[0], httpCodes.not_found);

        assertIsArray(err[1].hashes);

        assertIsUndefined(err[2]);
      }
    },
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

      "no error is encountered": (err, res) => {
        return assertDeepEqual(err, null);
      },

      "no blocks are returned": (err, res) => {
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

