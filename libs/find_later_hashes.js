const _ = require("underscore");

const until = require("async/until");

const getPrecedingBlockHash = require("./get_preceding_block_hash");

const codes = require("./../conf/http_status_codes");

/** Find the common hashes between the local chain and a group of hashes

  {
    after: <Block Hash String>
    before: <Block Hash String>
    hashes: Array<Block Hash String>
  }

  @returns via cbk
  Array<Block Hash String>
*/
module.exports = (args, cbk) => {
  let gotAll = false;
  let moreRecentHashes = [args.before];

  return until(
    () => {
      return gotAll;
    },
    (go_on) => {
      return getPrecedingBlockHash({
        hash: _(moreRecentHashes).last()
      },
      (err, hash) => {
        if (!!err) { console.log("GOT ERR", err); return go_on(err); }

        if (!hash) { return go_on([codes.server_error, "Expected hash"]); }

        const commonAncestorFound = _(args.hashes).contains(hash);

        if (commonAncestorFound) { return go_on(null, gotAll = true); }

        const firstLocalHashFound = hash === args.after;

        if (firstLocalHashFound) {
          return go_on([codes.not_found, {hashes: moreRecentHashes}]);
        }

        moreRecentHashes.push(hash);

        return go_on();
      });
    },
    (err) => {
      if (!!err) { return cbk(err); }

      return cbk(null, moreRecentHashes.reverse());
    });
};

