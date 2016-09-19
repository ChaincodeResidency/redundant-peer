const _ = require("underscore");
const each = require("async/each");
const forever = require("async/forever");

const logError = require("./../libs/log_error");
const refresh = require("./refresh");

const codes = require("./../conf/http_status_codes");
const server = require("./../conf/server");

/** Pull from remote peers

  {
    remote_peers: Array<Host String>
  }
*/
module.exports = (args) => {
  if (!Array.isArray(args.remote_peers)) {
    return logError({
      err: [codes.server_error, "Expected array of remote peers"]
    });
  }

  return each(args.remote_peers, (host, go_on) => {
    let path;

    return forever(
      (next) => {
        setTimeout(() => {
          return refresh({host, path}, (err, nextPath) => {
            if (!!err) { return next(err); }

            path = nextPath;

            return next();
          });
        },
        server.refresh_delay_ms);
      },
      go_on
    );
  },
  (err) => {
    if (!!err) { logError({err: err}); }
  });
};

