import fs from "fs";
import path from "path";
import { createZip, deleteZipFile } from "../services/zipService.js";
import { getAudioFilesByIds, processDownload } from "../services/downloadService.js";
import AudioFile from "../models/audioFileModel.js";

const downloadAudioFiles = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid request format. Please provide an array of audio file IDs." });
    }

    const audioFiles = await getAudioFilesByIds(ids);

    if (audioFiles.length === 0) {
      return res.status(404).json({ error: "No valid audio files found for the provided IDs" });
    }

    const filePaths = audioFiles.map(file => file.filePath);
    const zipFilePath = await createZip(filePaths, audioFiles);

    res.download(zipFilePath, `audio_files_${Date.now()}.zip`, (err) => {
      if (err) {
        console.error("Error sending ZIP file:", err);
        return res.status(500).json({ error: "Error sending ZIP file" });
      }
      deleteZipFile(zipFilePath);
    });
  } catch (error) {
    console.error("Error processing download request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const processYouTubeLinks = async (req, res) => {
  try {
    const { links } = req.body;

    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ error: "Invalid request format. Please provide an array of YouTube links." });
    }

    const results = await processDownload(links);
    const ids = results
      .filter(result => result.success)
      .map(result => result.audioFileId);

    res.json({ ids });
  } catch (error) {
    console.error("Error processing YouTube links:", error.message);
    res.status(500).json({ error: `Failed to process YouTube links: ${error.message}` });
  }
};

const getAudioFilesList = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'completed' } = req.query;

    const audioFiles = await AudioFile.find({ status })
      .select('_id videoId title duration fileSize downloadedAt')
      .sort({ downloadedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AudioFile.countDocuments({ status });

    res.json({
      files: audioFiles,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching audio files:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { downloadAudioFiles, processYouTubeLinks, getAudioFilesList };