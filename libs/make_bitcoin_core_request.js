const executeAsyncOperationsWithDependencies = require("async/auto");
const BitcoinCoreClient = require("bitcoin").Client;

const getCookieCredentials = require("./get_cookie_credentials");
const hasLocalCore = require("./has_local_core");
const returnResult = require("./return_result");

const httpCodes = require("./../conf/http_status_codes");

let credentials = null;

/** Make a request to the local Bitcoin Core

  {
    [ignore_error_code]: <Error Number>
    method: <Bitcoin Core RPC String>
    [params]: Array<Any>
  }

  @returns via cbk
  <Response Object>
*/
module.exports = (args, cbk) => {
  return executeAsyncOperationsWithDependencies({
    validateArguments: (go_on) => {
      if (!args.method) {
        return go_on([httpCodes.server_error, "Expected method", args]);
      }

      if (!hasLocalCore({})) {
        return go_on([httpCodes.server_error, "Missing Core", args]);
      }

      return go_on();
    },

    configuredCredentials: ["validateArguments", (res, go_on) => {
      credentials = credentials || require("./../credentials");

      return go_on(null, credentials);
    }],

    configuredAuth: ["configuredCredentials", (res, go_on) => {
      if (!!res.configuredCredentials.bitcoin_core_rpc_cookie_path) {
        return go_on();
      }

      return go_on(null, {
        pass: res.configuredCredentials.bitcoin_core_rpc_password,
        user: res.configuredCredentials.bitcoin_core_rpc_user
      });
    }],

    getCookieAuth: ["configuredCredentials", (res, go_on) => {
      if (!res.configuredCredentials.bitcoin_core_rpc_cookie_path) {
        return go_on();
      }

      return getCookieCredentials({
        cookie_path: credentials.bitcoin_core_rpc_cookie_path
      },
      go_on);
    }],

    credentials: ["configuredAuth", "getCookieAuth", (res, go_on) => {
      let auth = res.configuredAuth || res.getCookieAuth;

      if (!auth || !auth.user || !auth.pass) {
        return go_on([httpCodes.server_error, "Expected RPC auth"]);
      }

      go_on(null, auth);
    }],

    makeCoreRequest: ["credentials", (res, go_on) => {
      const client = new BitcoinCoreClient({
        pass: res.credentials.pass,
        user: res.credentials.user
      });

      const method = args.method;
      const params = args.params || [];

      return client.cmd([{method, params}], (err, response) => {
        // Exit early when ignoring an expected error
        if (!!err && err.code === args.ignore_error_code) { return go_on(); }

        if (!!err) {
          return go_on([
            httpCodes.server_error,
            "Bitcoin Core Error",
            {code: err.code, message: err.message}
          ]);
        }

        return go_on(null, response);
      });
    }]
  },
  returnResult({result: "makeCoreRequest"}, cbk));
};

