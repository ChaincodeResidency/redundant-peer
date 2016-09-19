const eachSeries = require("async/eachSeries");

const importBlock = require("./../libs/import_block");
const sendResponse = require("./../libs/send_response");

const codes = require("./../conf/http_status_codes");
const server = require("./../conf/server");

/** Receive new blocks

  @req.body
  Array<Block String>
*/
module.exports = (req, res) => {
  const commitResponse = sendResponse({res});

  if (!Array.isArray(req.body)) {
    return commitResponse([codes.bad_request, "Expected blocks array"]);
  }

  return eachSeries(req.body, (block, go_on) => {
    return importBlock({block}, go_on);
  },
  (err) => {
    if (!!err) { return commitResponse(err); }

    return commitResponse();
  });
};

