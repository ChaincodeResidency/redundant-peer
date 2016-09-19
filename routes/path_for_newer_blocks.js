const stringifyQuery = require("qs").stringify;

const serverConfiguration = require("./../conf/server");

/** Determine a path for more recent blocks

  {
    after_hash: <Block Hash String>
    [limit]: <Limit Number>
    [version]: <Version String>
  }

  @returns
  <Path String>
*/
module.exports = (args) => {
  const limit = args.limit;
  const version = args.version || serverConfiguration.api_version;

  const queryString = !!limit ? "?" + stringifyQuery({limit}) : "";

  return `/${version}/blocks/after/${args.after_hash}/${queryString}`;
};

