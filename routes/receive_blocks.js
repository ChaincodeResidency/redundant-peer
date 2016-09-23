const eachSeries = require("async/eachSeries");

const importBlock = require("./../libs/import_block");
const sendResponse = require("./../libs/send_response");

const httpCodes = require("./../conf/http_status_codes");
const server = require("./../conf/server");

const unlockKey = process.env.REDUNDANT_PEER_SECRET;

/** Receive new blocks

  @req.params
  {
    override_key: <String>
  }

  @req.body
  Array<Block String>
*/
module.exports = (req, res) => {
  const commitResponse = sendResponse({res});

  if (!Array.isArray(req.body)) {
    return commitResponse([httpCodes.bad_request, "Expected blocks array"]);
  }

  const trust = !!unlockKey && req.params.override_key === unlockKey;

  return eachSeries(req.body, (block, go_on) => {
    return importBlock({block, trust}, go_on);
  },
  (err) => {
    if (!!err) { return commitResponse(err); }

    return commitResponse();
  });
};

