import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { subscribeToYouTubeLinks } from "../utils/subscriber.js";
import AudioFile from "../models/audioFileModel.js";

const ytDlpPath = "yt-dlp";
const DOWNLOAD_DIR = "/tmp/downloads";

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const extractVideoId = (link) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = link.match(regex);
  return match ? match[1] : null;
};

const getVideoInfo = (link) => {
  return new Promise((resolve, reject) => {
    const ytDlpProcess = spawn(ytDlpPath, [
      "--dump-json",
      "--no-playlist",
      link
    ]);

    let output = '';
    ytDlpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytDlpProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(output);
          resolve({
            title: info.title,
            duration: info.duration,
            videoId: info.id
          });
        } catch (error) {
          reject(new Error('Failed to parse video info'));
        }
      } else {
        reject(new Error(`Failed to get video info with code ${code}`));
      }
    });

    ytDlpProcess.on('error', (err) => reject(err));
  });
};

const downloadAndConvertToAudio = async (link) => {
  return new Promise(async (resolve, reject) => {
    const videoId = extractVideoId(link);
    if (!videoId) return reject(new Error("Invalid YouTube link"));

    try {
      // Get video info first
      const videoInfo = await getVideoInfo(link);

      // Check if already exists in database
      const existingFile = await AudioFile.findOne({ videoId });
      if (existingFile && existingFile.status === 'completed') {
        return resolve({
          videoId,
          outputFilePath: existingFile.filePath,
          isExisting: true,
          audioFile: existingFile
        });
      }

      const outputFilePath = path.join(DOWNLOAD_DIR, `${videoId}.mp3`);

      // Create or update database record
      const audioFile = await AudioFile.findOneAndUpdate(
        { videoId },
        {
          videoId,
          title: videoInfo.title,
          originalUrl: link,
          filePath: outputFilePath,
          duration: videoInfo.duration,
          status: 'downloading'
        },
        { upsert: true, new: true }
      );

      const ytDlpProcess = spawn(ytDlpPath, [
        "-x",
        "--audio-format", "mp3",
        "-o", outputFilePath,
        link
      ]);

      ytDlpProcess.on("close", async (code) => {
        if (code === 0) {
          try {
            const stats = fs.statSync(outputFilePath);
            await AudioFile.findByIdAndUpdate(audioFile._id, {
              fileSize: stats.size,
              status: 'completed'
            });

            resolve({
              videoId,
              outputFilePath,
              isExisting: false,
              audioFile: await AudioFile.findById(audioFile._id)
            });
          } catch (error) {
            await AudioFile.findByIdAndUpdate(audioFile._id, {
              status: 'failed'
            });
            reject(new Error(`Failed to update file info: ${error.message}`));
          }
        } else {
          await AudioFile.findByIdAndUpdate(audioFile._id, {
            status: 'failed'
          });
          reject(new Error(`yt-dlp process failed with code ${code}`));
        }
      });

      ytDlpProcess.on("error", async (err) => {
        await AudioFile.findByIdAndUpdate(audioFile._id, {
          status: 'failed'
        });
        reject(err);
      });

      ytDlpProcess.stderr.on("data", () => { });
    } catch (error) {
      reject(error);
    }
  });
};

const processDownload = async (songLinks) => {
  const downloadResults = [];

  for (const link of songLinks) {
    try {
      const result = await downloadAndConvertToAudio(link);
      downloadResults.push({
        success: true,
        videoId: result.videoId,
        audioFileId: result.audioFile._id,
        title: result.audioFile.title,
        isExisting: result.isExisting
      });
    } catch (error) {
      downloadResults.push({
        success: false,
        videoId: null,
        error: error.message,
        link
      });
    }
  }

  return downloadResults;
};

const getAudioFilesByIds = async (audioFileIds) => {
  try {
    const audioFiles = await AudioFile.find({
      _id: { $in: audioFileIds },
      status: 'completed'
    });

    return audioFiles.filter(file => fs.existsSync(file.filePath));
  } catch (error) {
    console.error('Error fetching audio files:', error);
    return [];
  }
};

const deleteAudioFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file ${filePath}:`, err);
    });
  });
};

// Periodic file cleanup
const cleanupOldFiles = async () => {
  try {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    const oldFiles = await AudioFile.find({ downloadedAt: { $lt: threshold } });
    for (const file of oldFiles) {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
      await AudioFile.deleteOne({ _id: file._id });
    }
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// Subscribe to YouTube links
const channel = "youtube:link";
const handleYouTubeLink = async (link) => {
  try {
    await processDownload([link]);
  } catch (error) {
    console.error('Error processing YouTube link:', error);
  }
};

subscribeToYouTubeLinks(channel, handleYouTubeLink);

export { processDownload, getAudioFilesByIds, deleteAudioFiles };