const _ = require("underscore");
const auto = require("async/auto");

const banIps = require("./../libs/ban_ips");
const getPeers = require("./../libs/get_peers");
const logError = require("./../libs/log_error");

/** Ban non matching peers from local node

  {}
*/
module.exports = (args) => {
  return auto({
    getPeers: (go_on) => {
      return getPeers({}, go_on);
    },

    nonstandardIps: ["getPeers", (res, go_on) => {
      const nonstandardIps = res.getPeers
        .filter((p) => {
          return !/\/Satoshi:[\d]{1,2}\.[\d]{1,2}\.[\d]{1,2}\//.test(p.subver);
        })
        .map((p) => {
          return _(p.addr.split(":")).first();
        });

      return go_on(null, nonstandardIps);
    }],

    banPeers: ["nonstandardIps", (res, go_on) => {
      return banIps({ips: res.nonstandardIps}, go_on);
    }]
  },
  (err) => {
    if (!!err) { return logError({err: err}); }

    return;
  });
};

