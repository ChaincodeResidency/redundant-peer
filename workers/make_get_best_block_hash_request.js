const request = require("request");

const httpCodes = require("./../conf/http_status_codes");

/** Make a request to get the best hash

  {
    hash: <String>
    host: <String>
  }

  @returns via cbk
  <Best Block Hash String>

  OR

  <null> // When the hash supplied is already the remote best hash
*/
module.exports = (args, cbk) => {
  if (!args.hash || !args.host) {
    return cbk([httpCodes.server_error, "Expected hash, and host"]);
  }

  return request({
    url: `${args.host}/v0/best_hash_after/${hash}`
  },
  (err, r, hash) => {
    if (!!err) { return cbk([httpCodes.server_error, "Get hash err", err]); }

    const statusCode = !!r ? r.statusCode : null;

    if (statusCode === httpCodes.no_content) { return cbk(); }

    if (!hash) { return cbk([httpCodes.server_error, "Expected hash"]); }

    return cbk(null, hash);
  });
};

