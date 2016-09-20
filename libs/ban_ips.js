const each = require("async/each");

const makeCoreRequest = require("./make_bitcoin_core_request");

const codes = require("./../conf/http_status_codes");
const methods = require("./../conf/core_rpc_api_methods");

const yearInSeconds = 365 * 24 * 60 * 60;

/** Ban peer ips

  {
    ips: Array<IP String>
  }
*/
module.exports = (args, cbk) => {
  if (!Array.isArray(args.ips)) {
    return cbk([codes.server_error, "Expected array of ips"]);
  }

  return each(args.ips, (ip, go_on) => {
    return makeCoreRequest({
      method: methods.set_ban,
      params: [ip, "add", yearInSeconds]
    },
    go_on);
  },
  cbk);
};

