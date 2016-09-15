const logError = require("./log_error");

const codes = require("./../conf/http_status_codes");


/** Return the result of an auto function

  {
    result: <String>
  }

  @returns
  <Function>(err, res)
*/
module.exports = (args, cbk) => {
  return (err, res) => {
    if (!cbk) { return logError({err: [codes.server_error, "Expected cbk"]}); }

    if (!!err) { return cbk(err); }

    if (!args.result) {
      return cbk([codes.server_error, "Expected result key"]);
    }

    return cbk(null, res[args.result]);
  }
};

