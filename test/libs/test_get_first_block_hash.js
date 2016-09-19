const assertDeepEqual = require("assert").deepEqual;
const assertIsString = require("assert").isString;

const auto = require("async/auto");
const vows = require("vows");

const getBlock = require("./../../libs/get_block");
const getFirstBlockHash = require("./../../libs/get_best_block_hash");

vows
  .describe("Test Get First Hash")
  .addBatch({
    "When pulling the first block hash": {
      topic: function() {
        return auto({
          getFirstBlockHash: (go_on) => {
            return getFirstBlockHash({}, go_on);
          },

          getBlock: ["getFirstBlockHash", (res, go_on) => {
            return getBlock({hash: res.getFirstBlockHash}, go_on);
          }]
        },
        this.callback);
      },

      "there are no errors": (err, res) => {
        assertDeepEqual(null, err);
      },

      "the latest block hash is returned": (err, res) => {
        assertIsString(res.getFirstBlockHash);

        assertDeepEqual(res.getFirstBlockHash[0], "0");
      }
    }
  })
  .export(module); // Run it

