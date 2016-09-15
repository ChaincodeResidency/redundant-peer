const getBlocksAfterHashes = require("./../libs/get_blocks_after_hashes");
const sendResponse = require("./../libs/send_response");

/** Send a client blocks on the best chain after a hash

  @req.params
  {
    hashes: <Block Hashes CSV String>
  }

  @returns
  [
    <Serialized Block String>
  ]
*/
module.exports = (req, res) => {
  const hashes = (req.params.hashes || "").split(",");

  return getBlocksAfterHashes({hashes}, sendResponse({res}));
};

