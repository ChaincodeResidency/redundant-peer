const request = require("request");

const server = require("./../../conf/server");

/** Make an HTTP request to get blocks after a hash

  {
    hashes: Array<Hash String>
  }

  @returns via cbk
  Array<Block Hex String>
*/
module.exports = (args, cbk) => {
  if (!Array.isArray(args.hashes)) {
    return cbk([0, "Expected array of hashes"]);
  }

  const hashesCSV = args.hashes.join(",");
  const json = true;
  const serverPort = server.port;

  const url = `http://localhost:${serverPort}/v0/blocks/after/${hashesCSV}/`;

  return request({json, url}, (err, r, body) => {
    if (!!err) { return cbk([0, "Connection error", err]); }

    if (!r || !r.statusCode) { return cbk([0, "Expected status"]); }

    return cbk(null, body);
  });
};

