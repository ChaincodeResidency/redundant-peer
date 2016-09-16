const _ = require("underscore");

const getBlocksAfterHashes = require("./../libs/get_blocks_after_hashes");
const sendResponse = require("./../libs/send_response");

const codes = require("./../conf/http_status_codes");
const serverConf = require("./../conf/server");

/** Send a client blocks on the best chain after a hash

  @req.params
  {
    hashes: Array<Block Hashes CSV String>
  }

  @req.qs
  {
    [limit]: <Maximum Blocks Number> = $default_serialized_blocks_count
  }

  @res.link-header
  {
    [current]: <Refresh URL/relative path String>
    [next]: <Next Page URL/relative path String>
  }

  @res.body
  Array<Serialized Block String>
*/
module.exports = (req, res) => {
  return getBlocksAfterHashes({
    hashes: (req.params.hashes || "").split(","),
    limit: req.query.limit || serverConf.default_serialized_blocks_count
  },
  (err, r) => {
    const commitResponse = sendResponse({res});

    if (!!err) { return commitResponse(err); }

    const bestBlockHash = r.best_block_hash;

    if (!bestBlockHash) {
      return commitResponse([codes.server_error, "Expected best block hash"]);
    }

    const version = serverConf.api_version;

    if (!version) {
      return commitResponse([codes.server_error, "Expected version"]);
    }

    if (!r.has_more) {
      res.links({current: `/${version}/blocks/after/${bestBlockHash}/`});
    }
    else if (!!r.highest_block_hash) {
      res.links({next: `/${version}/blocks/after/${r.highest_block_hash}/`});
    }
    else {
      return commitResponse([codes.server_error, "Expected current or next"]);
    }

    return commitResponse(null, r.blocks);
  });
};

