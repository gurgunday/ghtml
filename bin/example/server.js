/* eslint n/no-missing-import: "off" */

import Fastify from "fastify";

const fastify = Fastify();

// Plugins
await fastify.register(import("@fastify/static"), {
  root: new URL("assets/", import.meta.url).pathname,
  prefix: "/p/assets/",
  wildcard: false,
  index: false,
  immutable: true,
  maxAge: 31536000 * 1000,
});
await fastify.register(import("fastify-html"));

// Routes
fastify.register(import("./routes/index.js"));

await fastify.listen({ port: 5050 });
console.warn("Server listening at http://localhost:5050");
