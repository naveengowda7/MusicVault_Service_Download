import fs from "fs";
import path from "path";
import os from "os";
import archiver from "archiver";

const createZip = (filePaths, audioFiles = []) => {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const zipFilePath = path.join(tempDir, `audio_files_${Date.now()}.zip`);

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`ZIP file created: ${zipFilePath} (${archive.pointer()} bytes)`);
      resolve(zipFilePath);
    });

    archive.on("error", (err) => reject(err));
    archive.pipe(output);

    filePaths.forEach((filePath, index) => {
      if (fs.existsSync(filePath)) {
        const fileName = audioFiles[index]
          ? `${audioFiles[index].title}.mp3`
          : path.basename(filePath);

        archive.file(filePath, { name: fileName });
      }
    });

    archive.finalize();
  });
};

const deleteZipFile = (zipFilePath) => {
  fs.unlink(zipFilePath, (err) => {
    if (err) console.error(`Error deleting ZIP file: ${err}`);
    else console.log(`Deleted ZIP file: ${zipFilePath}`);
  });
};

export { createZip, deleteZipFile };