const assert = require("assert");

const auto = require("async/auto");
const vows = require("vows");

const libs = "./../../libs/";

const getBestBlockHash = require(libs + "get_best_block_hash");
const getBlock = require(libs + "get_block");
const importBlock = require(libs + "import_block");

vows
  .describe("Test Import Block")
  .addBatch({
    "When importing a block": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getBlock: ["getBestBlockHash", (res, go_on) => {
            return getBlock({hash: res.getBestBlockHash}, go_on);
          }],

          importBlock: ["getBlock", (res, go_on) => {
            return importBlock({block: res.getBlock}, go_on);
          }]
        },
        this.callback);
      },

      "the block is imported": (err, res) => {
        assert.deepEqual(null, err);

        return;
      }
    }
  })
  .export(module); // Run it

