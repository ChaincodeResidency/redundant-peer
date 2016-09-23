const _ = require("underscore");

const logError = require("./log_error");

const configuration = require("./../conf/server");
const httpCodes = require("./../conf/http_status_codes");

/** Respond to a request

  {
    res: {
      send: <Send Response Function>
      status: <Set Status Function>
    }
  }

  @returns
  Function<Error, ResponseBody>

  Note: Errors passed should be [<Int> code, <Str> message, <Data> extra info]
*/
module.exports = (args) => {
  return function(err, body) {
    if (!args.res) {
      return logError({err: [httpCodes.server_error, "Missing res"]});
    }

    const hasNonstandardError = !!err && !Array.isArray(err);

    if (hasNonstandardError) {
      logError({err: [httpCodes.server_error, "Invalid error", err]});

      return args.res.status(httpCodes.server_error).send();
    }

    if (!!err) {
      const errorCode = err[0];

      const hasServerError = !!err && /^5/.test(errorCode+"");

      if (hasServerError) { logError({err: err}); }

      const errorMsg = err[1] || "Unexpected error";

      _(() => { return args.res.status(errorCode).send({error: errorMsg}); })
        .delay(configuration.error_delay_ms);

      return;
    }

    const hasNoContent = !body || (Array.isArray(body) && !body.length);

    if (hasNoContent) { return args.res.status(httpCodes.no_content).send(); }

    return args.res.send(body);
  }
};

