const fs = require("fs");
const path = require("path");
const zipService = require("../services/zipService");
const { getAudioFilePaths, deleteAudioFiles } = require("../services/downloadService");

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

    const zipFilePath = await zipService.createZip(filePaths);

    res.download(zipFilePath, "audio_files.zip", (err) => {
      if (err) {
        console.error("Error sending ZIP file:", err);
        return res.status(500).json({ error: "Error sending ZIP file" });
      }

      zipService.deleteZipFile(zipFilePath);
      deleteAudioFiles(filePaths);
    });

  } catch (error) {
    console.error("Error processing download request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { downloadAudioFiles };
