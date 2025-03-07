const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { subscribeToYouTubeLinks } = require("../utils/subscriber");

const ytDlpPath = "C:\\Users\\navee\\OneDrive\\Desktop\\projects\\SpoTube\\backend\\utils\\yt-dlp.exe";
const DOWNLOAD_DIR = path.join(__dirname, "../../downloads");

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

const extractVideoId = (link) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = link.match(regex);
  return match ? match[1] : null;
};

const downloadAndConvertToAudio = (link) => {
  return new Promise((resolve, reject) => {
    const videoId = extractVideoId(link);
    if (!videoId) {
      return reject(new Error("Invalid YouTube link"));
    }

    const outputFilePath = path.join(DOWNLOAD_DIR, `${videoId}.mp3`);

    const ytDlpProcess = spawn(ytDlpPath, [
      "-x",
      "--audio-format",
      "mp3",
      "-o",
      outputFilePath,
      link,
    ]);

    ytDlpProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`Download and conversion finished for ${link}`);
        resolve({ videoId, outputFilePath });
      } else {
        reject(new Error(`yt-dlp process exited with code ${code}`));
      }
    });

    ytDlpProcess.on("error", (err) => {
      reject(err);
    });

    ytDlpProcess.stderr.on("data", (data) => {
      console.error(`yt-dlp error: ${data}`);
    });
  });
};

const processDownload = async (songLinks) => {
  const downloadResults = [];

  for (const link of songLinks) {
    try {
      const { videoId, outputFilePath } = await downloadAndConvertToAudio(link);
      downloadResults.push({ videoId, outputFilePath });
    } catch (error) {
      console.error(`Error processing ${link}:`, error.message);
      downloadResults.push({ videoId: null, error: error.message });
    }
  }

  return downloadResults;
};

const getAudioFilePaths = (ids) => {
  return ids.map((id) => path.join(DOWNLOAD_DIR, `${id}.mp3`)).filter((filePath) => fs.existsSync(filePath));
};


const deleteAudioFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting ${filePath}:`, err);
      else console.log(`Deleted file: ${filePath}`);
    });
  });
};

const channel = "youtube:link";

const handleYouTubeLink = async (link) => {
  console.log("Received YouTube link:", link);

  try {
    const results = await processDownload([link]);
    console.log("Download results:", results);
  } catch (error) {
    console.error("Error processing YouTube link:", error);
  }
};

subscribeToYouTubeLinks(channel, handleYouTubeLink);

module.exports = { processDownload, getAudioFilePaths, deleteAudioFiles };
