const getBlock = require("./get_block");

const codes = require("./../conf/http_status_codes");

const previousHashes = {};

/** Get the block hash before a hash

  {
    hash: <String>
  }

  @returns via cbk
  <Block Hash String>

  OR

  <null> // When the previous block is not stored
*/
module.exports = (args, cbk) => {
  if (!args.hash) { return cbk([codes.server_error, "Expected hash"]); }

  // Exit early when the previous hash is cached
  if (!!previousHashes[args.hash]) {
    return cbk(null, previousHashes[args.hash]);
  }

  return getBlock({hash: args.hash, json: true}, (err, block) => {
    if (!!err) { return cbk(err); }

    if (!block.previousblockhash) {
      return cbk([codes.server_error, "Expected previous hash", block]);
    }

    previousHashes[args.hash] = block.previousblockhash;

    return cbk(null, block.previousblockhash);
  });
};

