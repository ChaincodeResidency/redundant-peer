/** Test the scenario where the catchup needs to rewind first

  # Setup: Alice, Bob

  Alice has a blockchain that looks like a, b
  Bob has a blockchain that looks like a, b1

  1. Bob requests updates from Alice starting from b1
  2. Alice returns 404 and a range of suggestions: [a, b]
  3. Bob requests updates starting from a
*/
const assertDeepEqual = require("assert").deepEqual;

const _ = require("underscore");
const auto = require("async/auto");
const vows = require("vows");

const libsPath = "./../../libs/";
const testPath = "./../";

const getBestBlockHash = require(libsPath + "get_best_block_hash");
const getBlock = require(libsPath + "get_block");
const getPrevBlockHash = require(libsPath + "get_preceding_block_hash");
const requestBlocks = require(testPath + "macros/request_newer_blocks");

vows
  .describe("Block reorg")
  .addBatch({
    "When a stale chain Bob asks Alice for block updates": {
      topic: function() {
        return auto({
          getAliceTipHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getAliceTipBlock: ["getAliceTipHash", (res, go_on) => {
            return getBlock({hash: res.getAliceTipHash}, go_on);
          }],

          getCommonHash: ["getAliceTipHash", (res, go_on) => {
            return getPrevBlockHash({hash: res.getAliceTipHash}, go_on);
          }],

          requestUpdatedBlocks: ["getAliceTipHash", (res, go_on) => {
            const fakeTipHash = res.getAliceTipHash.replace(/[abcde]/, "f");

            return requestBlocks({expect: 404, hashes: [fakeTipHash]}, go_on);
          }],

          requestFromCommonHash: ["requestUpdatedBlocks", (res, go_on) => {
            const hashes = res.requestUpdatedBlocks.blocks.error.hashes;

            if (!_(hashes).contains(res.getCommonHash)) {
              return go_on([0, "Expected a common hash"]);
            }

            return requestBlocks({hashes: [res.getCommonHash]}, go_on);
          }]
        },
        this.callback);
      },

      "no errors are encountered": (err, res) => {
        return assertDeepEqual(err, null);
      },

      "Bob becomes synced with Alice": (err, res) => {
        return assertDeepEqual(
          res.requestFromCommonHash.blocks,
          [res.getAliceTipBlock]
        );
      },
    }
  })
  .export(module); // Run it

