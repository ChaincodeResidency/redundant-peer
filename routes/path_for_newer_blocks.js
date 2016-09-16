const stringifyQuery = require("qs").stringify;

/** Determine a path for more recent blocks

  {
    after_hash: <Block Hash String>
    [limit]: <Limit Number>
    version: <Version String>
  }

  @returns
  <Path String>
*/
module.exports = (args) => {
  const limit = args.limit;

  const queryString = !!limit ? "?" + stringifyQuery({limit}) : "";

  return `/${args.version}/blocks/after/${args.after_hash}/${queryString}`;
};

