const auto = require("async/auto");

const getPrecedingBlockHash = require("./../libs/get_preceding_block_hash");
const sendResponse = require("./../libs/send_response");

const httpCodes = require("./../conf/http_status_codes");

/** Send the previous block hash before a hash

  @req.params
  {
    hash: <Block Hash String>
  }

  @req.body
  <Block Hash String>

  OR

  [204] // The previous hash is unknown
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

    getPrecedingBlockHash: ["validateArguments", (res, go_on) => {
      return getPrecedingBlockHash({hash: req.params.hash}, go_on);
    }]
  },
  (err, res) => {
    if (!!err) { return commitResponse(err); }

    return commitResponse(null, res.getPrecedingBlockHash);
  });
};

