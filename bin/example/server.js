/* eslint-disable n/no-missing-import */

import Fastify from "fastify";

const fastify = Fastify();

// Plugins
await fastify.register(import("@fastify/static"), {
  root: new globalThis.URL("assets/", import.meta.url).pathname,
  prefix: "/p/assets/",
  wildcard: false,
  index: false,
  immutable: true,
  maxAge: 31536000 * 1000,
});

// Routes
fastify.register(import("./routes/index.js"));

fastify.listen({ port: 5050 }, (err, address) => {
  if (err) {
    throw err;
  }

  globalThis.console.warn(`Server listening at ${address}`);
});
