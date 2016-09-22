const Block = require("bitcore-lib").Block;

const cacheConfiguration = require("./../conf/cache");
const codes = require("./../conf/http_status_codes");

const blockchainCache = require("./../cache/blockchain_cache");

/** Set a block to be cached

  {
    block: <Block Hash String>
  }
*/
module.exports = (args, cbk) => {
  const block = Block.fromString(args.block);

  if (!block || !block.header || !block.validMerkleRoot()) {
    return cbk([codes.bad_request, "Expected valid merkle root"]);
  }

  if (!block.header.validProofOfWork()) {
    return cbk([codes.bad_request, "Expected valid proof of work"]);
  }

  if (!block.header.validTimestamp()) {
    return cbk([codes.bad_request, "Expected valid timestamp"]);
  }

  const cache = blockchainCache;

  if (!cache.previous_hashes[block.id]) { cache.best_block_hash = block.id; }

  cache.previous_hashes[block.id] = block.header.toObject().prevHash;

  cache.serialized_blocks[block.id] = args.block;

  setTimeout(() => {
    return blockchainCache.serialized_blocks[block.id] = undefined;
  },
  cacheConfiguration.cache_block_data_ms);

  return cbk();
};

