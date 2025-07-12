import express from "express";
import { downloadAudioFiles } from "../controllers/downloadController.js";

const router = express.Router();
router.post("/download", downloadAudioFiles);

export default router;
