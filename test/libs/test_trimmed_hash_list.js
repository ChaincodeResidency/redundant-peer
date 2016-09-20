const assertDeepEqual = require("assert").deepEqual;

const _ = require("underscore");
const vows = require("vows");

const trimmedHashList = require("./../../libs/trimmed_hash_list");

vows
  .describe("Test Trimmed Hash List")
  .addBatch({
    "When trimming a short hash list": {
      topic: trimmedHashList({hashes: _(3).range(), interval: 3}),

      "no trimming occurs": (hashes) => {
        return assertDeepEqual(hashes, [0, 1, 2]);
      }
    },

    "When trimming a longer hash list": {
      topic: trimmedHashList({hashes: _(8).range(), interval: 1}),

      "the hashes are trimmed": (hashes) => {
        return assertDeepEqual(hashes, [0, 2, 4, 6]);
      }
    },

    "When trimming a very long hash list": {
      topic: trimmedHashList({hashes: _(1000).range(), interval: 144}),

      "the hashes are trimmed": (hashes) => {
        return assertDeepEqual(hashes, [0, 111, 428, 669, 855]);
      }
    },

    "When trimming an extremely long list": {
      topic: trimmedHashList({hashes: _(1000000).range(), interval: 144}),

      "the hashes are reduced to a smaller list": (hashes) => {
        return assertDeepEqual(hashes.length, 21);
      }
    }
  })
  .export(module); // Run it

