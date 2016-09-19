const request = require("request");

const server = require("./../../conf/server");

/** Make an HTTP request to submit a block to the server

  {
    blocks: Array<Serialized Block String>
  }
*/
module.exports = (args, cbk) => {
  if (!Array.isArray(args.blocks)) { return cbk([0, "Expected blocks arr"]); }

  return request({
    json: args.blocks,
    method: "POST",
    url: `http://localhost:${server.port}/v0/blocks/`
  },
  (err, r, body) => {
    if (!!err) { return cbk([0, "Connection error", err]); }

    if (!r || !r.headers || !r.statusCode) {
      return cbk([0, "Expected headers, status"]);
    }

    if (r.statusCode !== 204) {
      return cbk([0, "Unexpected response", r.statusCode]);
    }

    return cbk();
  });
};

