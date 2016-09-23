const auto = require("async/auto");

const getBestBlockHash = require("./../libs/get_best_block_hash");
const getBlock = require("./../libs/get_block");
const sendResponse = require("./../libs/send_response");

const httpCodes = require("./../conf/http_status_codes");

/** Send the best block hash after a starting hash

  @req.params
  {
    hash: <Block Hash String>
  }

  @req.body
  <Block Hash String>

  OR

  [204] // There are no better hashes than the one sent
*/
module.exports = (req, res) => {
  const commitResponse = sendResponse({res});

  return auto({
    validateArguments: (go_on) => {
      if (!req.params.hash) {
        return go_on([httpCodes.bad_request, "Expected block hash"]);
      }

      return go_on();
    },

    getBestBlockHash: ["validateArguments", (res, go_on) => {
      return getBestBlockHash({}, go_on);
    }]
  },
  (err, res) => {
    if (!!err) { return commitResponse(err); }

    if (res.getBestBlockHash === req.params.hash) { return commitResponse(); }

    return commitResponse(null, res.getBestBlockHash);
  });
};

