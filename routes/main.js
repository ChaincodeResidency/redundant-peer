const expressRouter = require("express").Router;

const sendBlocksAfterHashes = require("./send_blocks_after_hashes");

const router = expressRouter();

router.get("/blocks/after/:hashes/", sendBlocksAfterHashes);

module.exports = router;

