const expressRouter = require("express").Router;

const receiveBlocks = require("./receive_blocks");
const sendBlocksAfterHashes = require("./send_blocks_after_hashes");

const router = expressRouter();

router.get("/blocks/after/:hashes/", sendBlocksAfterHashes);

router.post("/blocks/", receiveBlocks);

router.post("/blocks/:override_key/", receiveBlocks);

module.exports = router;

