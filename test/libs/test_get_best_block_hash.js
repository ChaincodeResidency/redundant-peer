const assertDeepEqual = require("assert").deepEqual;
const assertIsString = require("assert").isString;

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
        assertDeepEqual(null, err);

        assertDeepEqual(true, !!hash);
        assertIsString(hash);
        assertDeepEqual(hash[0], "0");
      }
    }
  })
  .export(module); // Run it

