import fs from "fs";
import path from "path";
import { createZip, deleteZipFile } from "../services/zipService.js";
import { getAudioFilePaths, deleteAudioFiles } from "../services/downloadService.js";

const downloadAudioFiles = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const filePaths = getAudioFilePaths(ids);

    if (filePaths.length === 0) {
      return res.status(404).json({ error: "No valid audio files found" });
    }

    const zipFilePath = await createZip(filePaths);

    res.download(zipFilePath, "audio_files.zip", (err) => {
      if (err) {
        console.error("Error sending ZIP file:", err);
        return res.status(500).json({ error: "Error sending ZIP file" });
      }

      deleteZipFile(zipFilePath);
      deleteAudioFiles(filePaths);
    });

  } catch (error) {
    console.error("Error processing download request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { downloadAudioFiles };
