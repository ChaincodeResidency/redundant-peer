/** Test the refresh worker fetching new data
*/
const assertDeepEqual = require("assert").deepEqual;

const asyncConstant = require("async/constant");
const auto = require("async/auto");
const vows = require("vows");

const getBlock = require("./../../libs/get_block");
const getFirstBlockHash = require("./../../libs/get_first_block_hash");
const pathForNewerBlocks = require("./../../routes/path_for_newer_blocks");
const refresh = require("./../../workers/refresh");

const server = require("./../../conf/server");

vows
  .describe("Run Refresh Worker")
  .addBatch({
    "When the refresh worker runs to get new block data": {
      topic: function() {
        return auto({
          getFirstBlockHash: (go_on) => {
            return getFirstBlockHash({
              max_depth: Math.min(
                server.service_block_catchup_limit,
                server.max_service_serialized_blocks_count
              )
            },
            go_on);
          },

          host: asyncConstant(`http://localhost:${server.port}`),

          getRetryPath: ["host", (res, go_on) => {
            return refresh({
              host: res.host,
              path: pathForNewerBlocks({after_hash: "0"})
            },
            go_on);
          }],

          getMissingBlocks: ["getFirstBlockHash", "host", (res, go_on) => {
            return refresh({
              host: res.host,
              path: pathForNewerBlocks({after_hash: res.getFirstBlockHash})
            },
            go_on);
          }],

          getNoBlocks: ["getMissingBlocks", "host", (res, go_on) => {
            return refresh({
              host: res.host,
              path: res.getMissingBlocks
            },
            go_on);
          }],
        },
        this.callback);
      },

      "there are no errors": (err, res) => {
        assertDeepEqual(err, null);
      },

      "current path is current": (err, res) => {
        assertDeepEqual(res.getNoBlocks, res.getMissingBlocks);
      }
    }
  })
  .export(module); // Run it

