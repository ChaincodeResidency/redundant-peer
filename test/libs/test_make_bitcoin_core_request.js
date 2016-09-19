const assertDeepEqual = require("assert").deepEqual;
const assertIsObject = require("assert").isObject;

const vows = require("vows");

const libs = "./../../libs/";

const makeBitcoinCoreRequest = require(libs + "make_bitcoin_core_request");

const methods = require("./../../conf/core_rpc_api_methods");

vows
  .describe("Test Make Bitcoin Core Request")
  .addBatch({
    "When making a Bitcoin Core request": {
      topic: function() {
        makeBitcoinCoreRequest({method: methods.get_info}, this.callback);
      },

      "there is no error": (err, res) => {
        assertDeepEqual(null, err);

        assertIsObject(res);
      }
    }
  })
  .export(module); // Run it

