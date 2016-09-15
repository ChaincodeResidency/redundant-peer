const assert = require("assert");

const auto = require("async/auto");
const vows = require("vows");

const getBestBlockHash = require("./../../libs/get_best_block_hash");
const getPrecedingBlockHash = require("./../../libs/get_preceding_block_hash");

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
        assert.deepEqual(null, err);

        assert.isString(res.getPrecedingBlockHash);

        assert.notDeepEqual(res.getBestBlockHash, res.getPrecedingBlockHash);

        return;
      }
    }
  })
  .export(module); // Run it

