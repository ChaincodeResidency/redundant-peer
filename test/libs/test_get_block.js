const assertDeepEqual = require("assert").deepEqual;
const assertIsString = require("assert").isString;

const auto = require("async/auto");
const vows = require("vows");

const getBestBlockHash = require("./../../libs/get_best_block_hash");
const getBlock = require("./../../libs/get_block");

vows
  .describe("Test Get Block")
  .addBatch({
    "When pulling the latest block": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getRawBlock: ["getBestBlockHash", (res, go_on) => {
            return getBlock({hash: res.getBestBlockHash}, go_on);
          }],

          getBlockJSON: ["getBestBlockHash", (res, go_on) => {
            return getBlock({hash: res.getBestBlockHash, json: true}, go_on);
          }]
        },
        this.callback);
      },

      "the block is returned": (err, res) => {
        assertDeepEqual(null, err);

        assertIsString(res.getRawBlock);

        assertDeepEqual(res.getBestBlockHash, res.getBlockJSON.hash);

        return;
      }
    }
  })
  .export(module); // Run it

