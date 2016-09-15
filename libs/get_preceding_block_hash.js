const getBlock = require("./get_block");

const codes = require("./../conf/http_status_codes");

/** Get the block hash before a hash

  {
    hash: <String>
  }

  @returns via cbk
  <Block Hash String>
*/
module.exports = (args, cbk) => {
  if (!args.hash) { return cbk([codes.server_error, "Expected hash"]); }

  return getBlock({hash: args.hash, json: true}, (err, block) => {
    if (!!err) { return cbk(err); }

    if (!block.previousblockhash) {
      return cbk([codes.server_error, "Expected previous hash", block]);
    }

    return cbk(null, block.previousblockhash);
  });
};

