/** Test the scenario where a block is submit to the service
*/
const assertDeepEqual = require("assert").deepEqual;

const auto = require("async/auto");
const vows = require("vows");

const libsPath = "./../../libs/";
const testPath = "./../";

const getBestBlockHash = require(libsPath + "get_best_block_hash");
const getBlock = require(libsPath + "get_block");
const submitBlocks = require(testPath + "macros/submit_blocks");

vows
  .describe("Block submission")
  .addBatch({
    "When a block is sent to the server": {
      topic: function() {
        return auto({
          getBestBlockHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getBestBlock: ["getBestBlockHash", (res, go_on) => {
            return getBlock({hash: res.getBestBlockHash}, go_on);
          }],

          requestUpdatedBlocks: ["getBestBlock", (res, go_on) => {
            return submitBlocks({blocks: [res.getBestBlock]}, go_on);
          }],
        },
        this.callback);
      },

      "no errors are encountered": (err, res) => {
        return assertDeepEqual(err, null);
      },
    }
  })
  .export(module); // Run it

