const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const os = require("os");

const createZip = (filePaths) => {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const zipFilePath = path.join(tempDir, `audio_files_${Date.now()}.zip`);

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`ZIP file created: ${zipFilePath}`);
      resolve(zipFilePath);
    });

    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    filePaths.forEach((file) => {
      archive.file(file, { name: path.basename(file) });
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

module.exports = { createZip, deleteZipFile };
