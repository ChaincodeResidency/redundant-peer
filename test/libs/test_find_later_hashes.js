const assertDeepEqual = require("assert").deepEqual;

const auto = require("async/auto");
const vows = require("vows");

const findLaterHashes = require("./../../libs/find_later_hashes");
const getFirstBlockHash = require("./../../libs/get_first_block_hash");

vows
  .describe("Test Find Later Hashes")
  .addBatch({
    "When there is no preceding hash": {
      topic: function() {
        return auto({
          getFirstBlockHash: (go_on) => {
            return getFirstBlockHash({}, go_on);
          },

          getPrecedingHash: ["getFirstBlockHash", (res, go_on) => {
            return findLaterHashes({
              after: res.getFirstBlockHash,
              before: res.getFirstBlockHash,
              hashes: [res.getFirstBlockHash]
            },
            go_on);
          }]
        },
        this.callback);
      },

      "there is no error": (err, res) => {
        return assertDeepEqual(null, err);
      },

      "only the current hash is returned": (err, res) => {
        return assertDeepEqual(res.getPrecedingHash, [res.getFirstBlockHash]);
      }
    }
  })
  .export(module); // Run it

