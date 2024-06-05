require("dotenv").config();

const server = require("./app/server");
const { startUpload } = require("./app/startUpload");

server.listen().then(() => {
  startUpload();
});
