const assertDeepEqual = require("assert").deepEqual;

const auto = require("async/auto");
const vows = require("vows");

const findLaterHashes = require("./../../libs/find_later_hashes");
const getBestBlockHash = require("./../../libs/get_best_block_hash");
const getFirstBlockHash = require("./../../libs/get_first_block_hash");
const getPrecedingBlockHash = require("./../../libs/get_preceding_block_hash");

vows
  .describe("Test Find Later Hashes")
  .addBatch({
    "When there is no preceding hash": {
      topic: function() {
        return auto({
          getFirstBlockHash: (go_on) => {
            return getFirstBlockHash({}, go_on);
          },

          getLaterHashes: ["getFirstBlockHash", (res, go_on) => {
            return findLaterHashes({
              after: res.getFirstBlockHash,
              before: res.getFirstBlockHash,
              hashes: [res.getFirstBlockHash]
            },
            go_on);
          }]
        },
        this.callback);
      },

      "there is no error": (err, res) => {
        return assertDeepEqual(err, null);
      },

      "only the current hash is returned": (err, res) => {
        return assertDeepEqual(res.getLaterHashes, [res.getFirstBlockHash]);
      }
    },

    "When there is a preceding hash": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getPrecedingBlockHash: ["getBestBlockHash", (res, go_on) => {
            return getPrecedingBlockHash({hash: res.getBestBlockHash}, go_on);
          }],

          getLaterHashes: [
            "getBestBlockHash",
            "getPrecedingBlockHash",
            (res, go_on) =>
          {
            return findLaterHashes({
              after: res.getPrecedingBlockHash,
              before: res.getBestBlockHash,
              hashes: [res.getPrecedingBlockHash]
            },
            go_on);
          }]
        },
        this.callback);
      },

      "there is no error": (err, res) => {
        return assertDeepEqual(err, null);
      },

      "a later hash is returned": (err, res) => {
        return assertDeepEqual(res.getLaterHashes, [res.getBestBlockHash]);
      }
    }
  })
  .export(module); // Run it

