const _ = require("underscore");

const until = require("async/until");

const getPrecedingBlockHash = require("./get_preceding_block_hash");
const trimmedHashList = require("./trimmed_hash_list");

const httpCodes = require("./../conf/http_status_codes");

/** Find the newer hashes after a group of hashes

  {
    after: <Block Hash String>
    before: <Block Hash String>
    hashes: Array<Block Hash String>
  }

  @returns via cbk
  Array<Block Hash String>
*/
module.exports = (args, cbk) => {
  if (!args.after || !args.before || !Array.isArray(args.hashes)) {
    return cbk([httpCodes.server_error, "Expected after, before, and hashes"]);
  }

  let gotAll = false;
  const moreRecent = [args.before];

  return until(
    () => {
      return gotAll;
    },
    (go_on) => {
      return getPrecedingBlockHash({
          hash: _(moreRecent).last()
      },
      (err, hash) => {
        if (!!err) { return go_on(err); }

        if (!hash) { return go_on(null, gotAll = true); }

        const commonAncestorFound = _(args.hashes).contains(hash);

        if (commonAncestorFound) { return go_on(null, gotAll = true); }

        const firstLocalHashFound = hash === args.after;

        if (firstLocalHashFound) {
          const hashes = trimmedHashList({hashes: moreRecent.reverse()})

          return go_on([httpCodes.not_found, {hashes}]);
        }

        moreRecent.push(hash);

        return go_on();
      });
    },
    (err) => {
      if (!!err) { return cbk(err); }

      return cbk(null, moreRecent.reverse());
    });
};

