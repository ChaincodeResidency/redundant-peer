const _ = require("underscore");

const getNewerBlocks = require("./../libs/get_newer_blocks");
const pathForBlocks = require("./path_for_newer_blocks");
const sendResponse = require("./../libs/send_response");

const httpCodes = require("./../conf/http_status_codes");
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

  OR

  404: {error: {hashes: Array<Other Block Hashes To Try>}} // Try these hashes?
*/
module.exports = (req, res) => {
  const limit = Math.max(
    serverConf.max_service_serialized_blocks_count,
    req.query.limit || serverConf.default_serialized_blocks_count
  );

  return getNewerBlocks({
    catchup_limit: serverConf.service_block_catchup_limit,
    hashes: (req.params.hashes || "").split(","),
    limit: req.query.limit || serverConf.default_serialized_blocks_count,
  },
  (err, r) => {
    const commitResponse = sendResponse({res});

    if (!!err) { return commitResponse(err); }

    if (!r.best_block_hash) {
      return commitResponse([httpCodes.server_error, "Expected best hash"]);
    }

    if (!serverConf.api_version) {
      return commitResponse([httpCodes.server_error, "Expected version"]);
    }

    if (!r.has_more) {
      res.links({
        current: pathForBlocks({
          after_hash: r.best_block_hash,
          limit: req.query.limit,
          version: serverConf.api_version,
        })
      });
    }
    else if (!!r.highest_block_hash) {
      res.links({
        next: pathForBlocks({
          after_hash: r.highest_block_hash,
          limit: req.query.limit,
          version: serverConf.api_version,
        })
      });
    }
    else {
      return commitResponse([httpCodes.server_error, "Expected current/next"]);
    }

    return commitResponse(null, r.blocks);
  });
};

