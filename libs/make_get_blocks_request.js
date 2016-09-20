const parseLinkHeader = require("parse-link-header");
const request = require("request");

const getHighestBlockHash = require("./get_highest_block_hash");
const pathForNewerBlocks = require("./../routes/path_for_newer_blocks");

const codes = require("./../conf/http_status_codes");

/** Make a request to get blocks

  {
    host: <String>
    path: <String>
  }

  @returns via cbk
  {
    [blocks]: Array<Block String>
    iterate_path: <Path String>
  }
*/
module.exports = (args, cbk) => {
  if (!args.host || !args.path) {
    return cbk([codes.server_error, "Expected host, and path"]);
  }

  return request({
    json: true,
    url: `${args.host}${args.path}`
  },
  (err, r, body) => {
    if (!!err) { return cbk([codes.server_error, "Blocks Error", err]); }

    const statusCode = !!r ? r.statusCode : null;

    if (statusCode === codes.not_found && !!body && !!body.error) {
      return getHighestBlockHash({hashes: body.error.hashes}, (err, hash) => {
        if (!!err) { return cbk(err); }

        if (!hash) { return cbk([codes.server_error, "Sync gap too great"]); }

        cbk(null, {iterate_path: pathForNewerBlocks({after_hash: hash})});

        return;
      });
    }

    if (statusCode === codes.no_content) {
      return cbk(null, {iterate_path: args.path});
    }

    if (!r || !r.headers || !r.headers.link) {
      return cbk([codes.server_error, "Expected link header"]);
    }

    const parsedLinks = parseLinkHeader(r.headers.link) || {};

    if (!parsedLinks.current && !parsedLinks.next) {
      return cbk([codes.server_error, "Expected link"]);
    }

    if (!Array.isArray(body)) {
      return cbk([codes.server_error, "Expected blocks"]);
    }

    const blocks = body;

    if (!!parsedLinks.current && !!parsedLinks.current.url) {
      return cbk(null, {blocks, iterate_path: parsedLinks.current.url});
    }

    if (!!parsedLinks.next && !!parsedLinks.next.url) {
      return cbk(null, {blocks, iterate_path: parsedLinks.next.url});
    }

    return cbk([codes.server_error, "Expected path"]);
  });
};

