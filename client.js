const net = require("node:net");
const fs = require("node:fs/promises");
const path = require("node:path");
const { log } = require("node:console");
const clearLine = (dir) => {
  return new Promise((resolve, reject) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
};
const moveCursor = (dx, dy) => {
  return new Promise((resolve, reject) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};
const socket = net.createConnection({ host: "::1", port: 5050 }, async () => {
  const filePath = process.argv[2];
  // console.log(filePath);
  const fileName = path.basename(filePath);
  // console.log(fileName);
  const fileHandle = await fs.open(filePath, "r");
  const fileStream = fileHandle.createReadStream();
  const fileSize = (await fileHandle.stat()).size;
  // console.log(fileSize);
  let uploadedPercetage = 0;
  let bytesUploaded = 0;
  socket.write(`fileName: ${fileName}---`);
  console.log();
  // read data from source file
  fileStream.on("data", async (data) => {
    if (!socket.write(data)) {
      fileStream.pause();
    }
    bytesUploaded += data.length;
    let newPercentage = Math.floor((bytesUploaded / fileSize) * 100);
    if (newPercentage % 5 === 0 && uploadedPercetage !== newPercentage) {
      uploadedPercetage = newPercentage;
      await moveCursor(0, -1);
      await clearLine(0);
      console.log(`Uploading...${uploadedPercetage}%`);
    }
  });
  socket.on("drain", () => {
    fileStream.resume();
  });
  fileStream.on("end", () => {
    console.log("The file was successfully uploaded");
    fileHandle.close();
    socket.end();
  });
});
