const Block = require("bitcore-lib").Block;

const cacheConfiguration = require("./../conf/cache");

const blockchainCache = require("./../cache/blockchain_cache");

/** Set a block to be cached

  {
    block: <Block Hash String>
  }
*/
module.exports = (args, cbk) => {
  const id = Block.fromString(args.block).id;

  blockchainCache.serialized_blocks[id] = args.block;

  setTimeout(() => {
    return blockchainCache.serialized_blocks[id] = undefined;
  },
  cacheConfiguration.cache_block_data_ms);

  return cbk();
};

