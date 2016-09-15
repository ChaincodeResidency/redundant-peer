const assert = require("assert");

const vows = require("vows");

const getBestBlockHash = require("./../../libs/get_best_block_hash");

vows
  .describe("Test Get Block Hash")
  .addBatch({
    "When pulling the latest block hash": {
      topic: function() {
        return getBestBlockHash({}, this.callback);
      },

      "the latest block hash is returned": (err, hash) => {
        assert.deepEqual(null, err);

        assert.deepEqual(true, !!hash);
        assert(typeof hash === "string");
        assert.deepEqual(hash[0], "0");
      }
    }
  })
  .export(module); // Run it

