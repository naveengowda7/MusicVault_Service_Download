const express = require("express");
const router = express.Router();
const { downloadAudioFiles } = require("../controllers/downloadController");

router.post("/download", downloadAudioFiles);

module.exports = router;
