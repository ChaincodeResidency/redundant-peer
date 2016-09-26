const hasLocalCore = require("./has_local_core");
const makeCoreRequest = require("./make_bitcoin_core_request");

const coreErrorCodes = require("./../conf/core_error_codes");
const httpCodes = require("./../conf/http_status_codes");
const methods = require("./../conf/core_rpc_api_methods");

const blockchainCache = require("./../cache/blockchain_cache");

/** Get the block hash before a hash

  {
    hash: <String>
  }

  @returns via cbk
  <Block Hash String>

  OR

  <null> // When the previous block is not stored or there is a Core RPC error
*/
module.exports = (args, cbk) => {
  if (!args.hash) { return cbk([httpCodes.server_error, "Expected hash"]); }

  const cachedPreviousHash = blockchainCache.previous_hashes[args.hash];

  // Exit early when the previous hash is cached
  if (!!cachedPreviousHash) { return cbk(null, cachedPreviousHash); }

  if (!hasLocalCore({})) { return cbk(); }

  return makeCoreRequest({
    ignore_error_code: coreErrorCodes.rpc_internal_error,
    method: methods.get_block,
    params: [args.hash, true]
  },
  (err, block) => {
    if (!!err) { return cbk(err); }

    if (!block) { return cbk(); }

    if (!block.previousblockhash) {
      return cbk([httpCodes.server_error, "Expected previous hash", block]);
    }

    blockchainCache.previous_hashes[args.hash] = block.previousblockhash;

    return cbk(null, block.previousblockhash);
  });
};

