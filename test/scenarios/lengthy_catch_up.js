/** Test the scenario where the catchup is iterative and paged

  # Setup: Alice, Bob

  Alice has a blockchain that looks like a, b, c
  Bob has a blockchain that looks like a

  1. Bob requests updates from Alice starting from a
  2. Alice returns update b, indicates that there are more updates after that
  3. Bob request updates starting from b
*/
const assertDeepEqual = require("assert").deepEqual;
const assertIsString = require("assert").isString;
const assertIsUndefined = require("assert").isUndefined;

const _ = require("underscore");
const auto = require("async/auto");
const vows = require("vows");

const libsPath = "./../../libs/";
const testPath = "./../";

const getBestBlockHash = require(libsPath + "get_best_block_hash");
const getBlock = require(libsPath + "get_block");
const getPrevBlockHash = require(libsPath + "get_preceding_block_hash");
const importUpdated = require(testPath + "macros/import_updated_blocks");
const requestBlocks = require(testPath + "macros/request_newer_blocks");

vows
  .describe("Lengthy Catchup")
  .addBatch({
    "When very out-of-date Bob asks up-to-date Alice for block updates": {
      topic: function() {
        return auto({
          getAliceTipHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getAliceTipBlock: ["getAliceTipHash", (res, go_on) => {
            return getBlock({hash: res.getAliceTipHash}, go_on);
          }],

          getAlicePenultimateHash: ["getAliceTipHash", (res, go_on) => {
            return getPrevBlockHash({hash: res.getAliceTipHash}, go_on);
          }],

          getAlicePenultimateBlock: [
            "getAlicePenultimateHash",
            (res, go_on) =>
          {
            return getBlock({hash: res.getAlicePenultimateHash}, go_on);
          }],

          getBobTipHash: ["getAlicePenultimateHash", (res, go_on) => {
            const hash = res.getAlicePenultimateHash;

            return getPrevBlockHash({hash}, go_on);
          }],

          requestUpdatedBlocks: [
            "getAlicePenultimateHash",
            "getBobTipHash",
            (res, go_on) =>
          {
            return requestBlocks({
              hashes: [res.getBobTipHash],
              limit: [res.getAlicePenultimateHash].length
            },
            go_on);
          }],

          importUpdatedBlocks: ["requestUpdatedBlocks", (res, go_on) => {
            const blocks = res.requestUpdatedBlocks.blocks;

            return importUpdated({blocks}, go_on);
          }],

          requestMoreBlocks: [
            "getAlicePenultimateHash",
            "requestUpdatedBlocks",
            (res, go_on) =>
          {
            return requestBlocks({
              hashes: [res.getAlicePenultimateHash],
              next: res.requestUpdatedBlocks.next
            },
            go_on);
          }],

          importMoreBlocks: ["requestMoreBlocks", (res, go_on) => {
            const blocks = res.requestMoreBlocks.blocks;

            return importUpdated({blocks}, go_on);
          }]
        },
        this.callback);
      },

      "no errors are encountered": (err, res) => {
        return assertDeepEqual(err, null);
      },

      "the first response includes a next link and a block": (err, res) => {
        const firstBlocksResponse = res.requestUpdatedBlocks;

        assertIsString(firstBlocksResponse.links.next);

        assertIsUndefined(firstBlocksResponse.links.current);

        const firstRequestedBlock = _(firstBlocksResponse.blocks).first();

        assertDeepEqual(firstRequestedBlock, res.getAlicePenultimateBlock);

        return;
      },

      "the second response includes current link and a block": (err, res) => {
        const secondBlocksResponse = res.requestMoreBlocks;

        assertIsString(secondBlocksResponse.links.current);

        assertIsUndefined(secondBlocksResponse.links.next);

        const secondRequestedBlock = _(secondBlocksResponse.blocks).first();

        assertDeepEqual(secondRequestedBlock, res.getAliceTipBlock);

        return;
      }
    }
  })
  .export(module); // Run it

