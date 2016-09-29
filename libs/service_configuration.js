/** Determine service configuration

  {
    [credentials]: {
      [bitcoin_core_rpc_password]: <Auth Password String>
      [bitcoin_core_rpc_user]: <Auth Username String>
      [cache_peers]: [{host: <Host String>, secret: <Service Secret String>}]
      [remote_peers]: [<Host String>]
    }
    [service_secret]: <Service Secret String>
  }

  @returns
  {
    is_light_mode: <Bool>
    is_missing_secret: <Bool>
    polling_count: <Hosts to Poll Number>
    pushing_count: <Hosts to Push Number>
  }
*/
module.exports = (args) => {
  const auth = {
    pass: !args.credentials ? "" : args.credentials.bitcoin_core_rpc_password,
    user: !args.credentials ? "" : args.credentials.bitcoin_core_rpc_user
  };

  const hasAuth = !!auth.pass && !!auth.user;
  const pullingFrom = !args.credentials ? [] : args.credentials.remote_peers;
  const pushingTo = !args.credentials ? [] : args.credentials.cache_peers;

  return {
    is_light_mode: !hasAuth,
    is_missing_secret: !hasAuth && !args.service_secret,
    polling_count: (pullingFrom || []).length,
    pushing_count: (pushingTo || []).length
  };
};

