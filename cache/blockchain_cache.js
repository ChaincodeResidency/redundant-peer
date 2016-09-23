const blockchain = require("./../conf/blockchain");

/** Ephemeral blockchain data

  {
    best_block_hash: <Block Hash String>
    deepest_block_hash: <Block Hash String>
    previous_hashes: Array<Block Hash String>
    serialized_blocks: Array<Serialized Block String>
  }
*/
module.exports = {
  best_block_hash: blockchain.genesis_block_hash,
  previous_hashes: {},
  serialized_blocks: {
    [blockchain.genesis_block_hash]: blockchain.serialized_genesis_block
  },
};

