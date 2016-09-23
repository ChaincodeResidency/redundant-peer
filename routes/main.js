const expressRouter = require("express").Router;

const receiveBlocks = require("./receive_blocks");
const sendBestBlockHash = require("./send_best_block_hash");
const sendBlocksAfterHashes = require("./send_blocks_after_hashes");
const sendPrecedingBlockHash = require("./send_preceding_block_hash");

const router = expressRouter();

router.get("/blocks/after/:hashes/", sendBlocksAfterHashes);

router.get("/blocks/best_hash_after/:hash", sendBestBlockHash);

router.get("/blocks/hash_before/:hash", sendPrecedingBlockHash);

router.post("/blocks/", receiveBlocks);

router.post("/blocks/:override_key/", receiveBlocks);

module.exports = router;

