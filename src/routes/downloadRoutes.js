import express from "express";
import { downloadAudioFiles, processYouTubeLinks, getAudioFilesList } from "../controllers/downloadController.js";

const router = express.Router();

router.post("/download", downloadAudioFiles);
router.post("/process", processYouTubeLinks);
router.get("/files", getAudioFilesList);

export default router;