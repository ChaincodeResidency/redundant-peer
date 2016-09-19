const detectSeries = require("async/detectSeries");

const getBlock = require("./get_block");

const codes = require("./../conf/http_status_codes");

/** Get the highest local block hash from a sorted array of hashes

  {
    hashes: Array<Block Hash String>
  }

  @returns via cbk
  <Path String>
*/
module.exports = (args, cbk) => {
  if (!Array.isArray(args.hashes)) {
    return cbk([codes.server_error, "Expected hashes", args]);
  }

  return detectSeries(args.hashes.reverse(), (hash, go_on) => {
    return getBlock({hash}, go_on);
  },
  cbk);
};

