const net = require("node:net");
const fs = require("node:fs/promises");
const server = net.createServer(() => {});
server.on("connection", (socket) => {
  let fileHandle, fileStream;
  console.log("New connection");
  socket.on("data", async (data) => {
    let indexOfDivider;
    if (!fileHandle) {
      socket.pause();
      indexOfDivider = data.indexOf("---");
      const fileName = data.subarray(10, indexOfDivider).toString("utf-8");
      // console.log(fileName);

      fileHandle = await fs.open(`./storage/${fileName}`, "w");
      fileStream = fileHandle.createWriteStream();
      socket.resume();
      fileStream.on("drain", () => {
        socket.resume();
      });
    } else {
      // write to the destination file
      if (!fileStream.write(data.subarray(indexOfDivider + 3))) {
        socket.pause();
      }
    }
  });
  // This end event happens when the client.js file ends the socket
  socket.on("end", () => {
    if (fileHandle) fileHandle.close();
    fileHandle = undefined;
    fileStream = undefined;
    console.log("Connection ended");
  });
});
server.listen(5050, "::1", () => {
  console.log("Uploader server opened on", server.address());
});
