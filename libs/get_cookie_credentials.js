const readFile = require("fs").readFile;

const httpCodes = require("./../conf/http_status_codes");

/** Find cookie credentials

  {
    [cookie_path]: <Bitcoin Core Data Directory String>
  }

  @returns via cbk
  {
    pass: <String>
    user: <String>
  }
*/
module.exports = (args, cbk) => {
  return readFile(args.cookie_path, "utf8", (err, auth) => {
    if (!!err || !auth) {
      return cbk([httpCodes.server_error, "RPC cookie not found", err]);
    }

    const [user, pass] = auth.split(":");

    return cbk(null, {pass, user});
  });
};

