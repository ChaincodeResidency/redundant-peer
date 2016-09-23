const logError = require("./log_error");

const httpCodes = require("./../conf/http_status_codes");

/** Return the result of an auto function

  {
    [no_content]: <Bool> = false
    result: <String>
  }

  @returns
  <Function>(err, res)
*/
module.exports = (args, cbk) => {
  return (err, res) => {
    if (!cbk) {
      return logError({err: [httpCodes.server_error, "Expected cbk"]});
    }

    if (!!err) { return cbk(err); }

    if (!!args.no_content) { return cbk(); }

    if (!args.result) {
      return cbk([httpCodes.server_error, "Expected result key"]);
    }

    return cbk(null, res[args.result]);
  }
};

