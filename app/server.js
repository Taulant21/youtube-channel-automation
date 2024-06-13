const path = require("path");

const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

const fastify = require("fastify")({
  logger: {
    level: "debug",
  },
});

module.exports = {
  getLogger() {
    return fastify.log;
  },
  listen() {
    return fastify.listen(port, host).catch((err) => {
      fastify.log.error(err);
      process.exit(1);
    });
  },
};

fastify.register(require("fastify-helmet"));
fastify.register(require("fastify-sensible"));
fastify.register(require("fastify-static"), {
  root: path.resolve(__dirname, "../public"),
  prefix: "/",
});