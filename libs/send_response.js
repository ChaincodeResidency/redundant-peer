const _ = require("underscore");

const logError = require("./log_error");

const codes = require("./../conf/http_status_codes");

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
module.exports.respond = (args) => {
  return function(err, body) {
    if (!args.res) {
      return logError({err: [codes.server_error, "Missing res"]});
    }

    const hasNonstandardError = !!err && !Array.isArray(err);

    if (hasNonstandardError) {
      logError({err: [codes.server_error, "Invalid error", err]});

      return res.status(codes.server_error).send();
    }

    if (!!err) {
      const errorCode = err[0];

      const hasServerError = !!err && /^5/.test(errorCode+"");

      if (hasServerError) { logError({err: err}); }

      const errorMessage = err[1] || "Unexpected error";

      _(() => { return res.status(errorCode).send({error: errorMessage}); })
        .delay(1000);

      return;
    }

    const hasNoContent = !body || (Array.isArray(body) && !body.length);

    if (hasNoContent) { return res.status(codes.no_content).send(); }

    return res.send(body);
  }
};

