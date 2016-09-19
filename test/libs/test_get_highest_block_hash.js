const assertDeepEqual = require("assert").deepEqual;
const assertIsString = require("assert").isString;

const auto = require("async/auto");
const vows = require("vows");

const getBestBlockHash = require("./../../libs/get_best_block_hash");
const getHighestBlockHash = require("./../../libs/get_highest_block_hash");
const getNewerBlocks = require("./../../libs/get_newer_blocks");

vows
  .describe("Test Get Highest Block Hash")
  .addBatch({
    "When determining the highest block hash in an array of hashes": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getBlockHashes: (go_on) => {
            return getNewerBlocks({catchup_limit: 2, hashes: ["0"]}, (err) => {
              if (!err || !err[1] || !err[1].hashes) {
                return go_on([0, "Expected err", err]);
              }

              return go_on(null, err[1].hashes);
            });
          },

          getHighestBlockHash: ["getBlockHashes", (res, go_on) => {
            return getHighestBlockHash({hashes: res.getBlockHashes}, go_on);
          }]
        },
        this.callback);
      },

      "there is no error": (err, res) => {
        return assertDeepEqual(null, err);
      },

      "the highest block hash is returned": (err, res) => {
        return assertDeepEqual(res.getBestBlockHash, res.getHighestBlockHash);
      }
    }
  })
  .export(module); // Run it

