/** Test the scenario where everything is already up-to-date

  # Setup: Alice, Bob

  Alice has a blockchain that looks like a, b
  Bob has a blockchain that looks like a, b

  1. Bob requests updates from Alice
  2. Alice indicates that there are no updates to be had
*/
const assertDeepEqual = require("assert").deepEqual;
const assertIsUndefined = require("assert").isUndefined;
const assertIsObject = require("assert").isObject;
const assertIsString = require("assert").isString;

const auto = require("async/auto");
const vows = require("vows");

const libsPath = "./../../libs/";
const testPath = "./../";

const getBestBlockHash = require(libsPath + "get_best_block_hash");
const requestBlocks = require(testPath + "macros/request_newer_blocks");

vows
  .describe("Confirm up-to-date")
  .addBatch({
    "When up-to-date Bob asks up-to-date Alice for block updates": {
      topic: function() {
        return auto({
          getAliceTipHash: (go_on) => {
            return getBestBlockHash({}, go_on);
          },

          getUpdatesFromAlice: ["getAliceTipHash", (res, go_on) => {
            return requestBlocks({hashes: [res.getAliceTipHash]}, go_on);
          }]
        },
        this.callback);
      },

      "Alice returns that there are no new blocks": (err, res) => {
        assertDeepEqual(err, null);

        assertIsUndefined(res.getUpdatesFromAlice.blocks);

        assertIsObject(res.getUpdatesFromAlice.links);

        assertIsString(res.getUpdatesFromAlice.links.current);

        assertIsUndefined(res.getUpdatesFromAlice.links.next);

        return;
      }
    }
  })
  .export(module); // Run it

