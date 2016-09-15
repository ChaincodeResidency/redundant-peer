const _ = require("underscore");
const eachSeries = require("async/eachSeries");

const libsPath = "./../../libs/";

const importBlock = require(libsPath + "import_block");

/** Import blocks from updated data

  {
    blocks: Array<Serialized Block Hex String>
  }
*/
module.exports = (args, cbk) => {
  if (!args || !Array.isArray(args.blocks) || !args.blocks.length) {
    return cbk([0, "Expected blocks", args]);
  }

  return eachSeries(args.blocks, (block, go_on) => {
    return importBlock({block}, go_on);
  },
  cbk);
};

