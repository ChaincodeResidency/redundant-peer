const parseLinkHeader = require("parse-link-header");
const request = require("request");

const httpCodes = require("./../../conf/http_status_codes");
const server = require("./../../conf/server");

/** Make an HTTP request to get blocks after a hash

  {
    hashes: Array<Hash String>
    [limit]: <Maximum Blocks to Return Number>
    [next]: <More Blocks String>
  }

  @returns via cbk
  {
    blocks: Array<Block Hex String>
    links: {[current]: {url: <String>}, [next]: {url: <String>}}
  }
*/
module.exports = (args, cbk) => {
  if (!Array.isArray(args.hashes)) { return cbk([0, "Expected hash array"]); }

  const hashesCSV = args.hashes.join(",");
  const servicePort = server.port;

  const path = args.next || `/v0/blocks/after/${hashesCSV}/`;
  const service = `http://localhost:${servicePort}`;

  return request({
    json: true,
    qs: {limit: args.limit},
    url: `${service}${path}`
  },
  (err, r, body) => {
    if (!!err) { return cbk([0, "Connection error", err]); }

    if (!r || !r.headers || !r.statusCode) {
      return cbk([0, "Expected headers, status"]);
    }

    const links = {};
    const parsedLinks = parseLinkHeader(r.headers.link) || {};

    if (!!parsedLinks.current && !!parsedLinks.current.url) {
      links.current = parsedLinks.current.url;
    }

    if (!!parsedLinks.next && !!parsedLinks.next.url) {
      links.next = parsedLinks.next.url;
    }

    return cbk(null, {links, blocks: body});
  });
};

