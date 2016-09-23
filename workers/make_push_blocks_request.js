const request = require("request");

const httpCodes = require("./../conf/http_status_codes");

/** Make a request to get the best hash

  {
    blocks: Array<Hex Serialized Block String>
    host: <Host String>
    [secret]: <String>
  }
*/
module.exports = (args, cbk) => {
  if (!Array.isArray(args.blocks) || !args.blocks.length || !args.host) {
    return cbk([httpCodes.server_error, "Expected blocks, and host"]);
  }

  const trustPath = !!args.secret ? `${args.secret}/` : "";

  return request({
    json: args.blocks,
    method: "POST",
    url: `${args.host}/v0/blocks/${trustPath}`
  },
  (err, r, hash) => {
    if (!!err) {
      return cbk([httpCodes.server_error, "Submit blocks err", err]);
    }

    if (!r || r.statusCode !== httpCodes.ok) {
      return cbk([httpCodes.server_error, "Unexpected submit blocks err"]);
    }

    return cbk();
  });
};

