const hasTrustOverride = !!process.env.REDUNDANT_PEER_SECRET;

const credentials = hasTrustOverride ? {} : require("./../credentials");

/** Determine if there is a local Core instance

  {}

  @returns
  <Has Local Core Bool>
*/
module.exports = (args) => {
  return credentials.bitcoin_core_rpc_password
    && credentials.bitcoin_core_rpc_user;
};

