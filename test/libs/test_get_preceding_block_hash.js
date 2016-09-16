const assertDeepEqual = require("assert").deepEqual;
const assertIsString = require("assert").isString;
const assertNotDeepEqual = require("assert").notDeepEqual;

const auto = require("async/auto");
const vows = require("vows");

const libsPath = "./../../libs/";

const getBestBlockHash = require(libsPath + "get_best_block_hash");
const getPrecedingBlockHash = require(libsPath + "get_preceding_block_hash");

vows
  .describe("Test Get Previous Block Hash")
  .addBatch({
    "When determining the previous block hash": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getPrecedingBlockHash: ["getBestBlockHash", (res, go_on) => {
            return getPrecedingBlockHash({hash: res.getBestBlockHash}, go_on);
          }]
        },
        this.callback);
      },

      "the block is returned": (err, res) => {
        assertDeepEqual(null, err);

        assertIsString(res.getPrecedingBlockHash);

        assertNotDeepEqual(res.getBestBlockHash, res.getPrecedingBlockHash);

        return;
      }
    }
  })
  .export(module); // Run it

