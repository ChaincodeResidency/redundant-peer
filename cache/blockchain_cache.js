/** Ephemeral blockchain data

  {
    best_block_hash: <Block Hash String>
    deepest_block_hash: <Block Hash String>
    previous_hashes: Array<Block Hash String>
    serialized_blocks: Array<Serialized Block String>
  }
*/
module.exports = {
  best_block_hash: null,
  previous_hashes: {},
  serialized_blocks: {},
};

