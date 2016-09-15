const assert = require("assert");

const auto = require("async/auto");
const vows = require("vows");

const returnResult = require("./../../libs/return_result");

vows
  .describe("Test Return Result")
  .addBatch({
    "When returning the result of an automatic control flow": {
      topic: function() {
        return auto({
          returnedResult: (go_on) => {
            return auto({
              a: (val) => { return val(); },

              b: (val) => { return val(null, true); }
            },
            returnResult({result: "b"}, go_on));
          }
        },
        this.callback);
      },

      "the result is returned": (err, res) => {
        assert.deepEqual(err, null);

        assert.deepEqual(res, {returnedResult: true});

        return;
      }
    }
  })
  .export(module); // Run it

