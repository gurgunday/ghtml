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

// Listen
const address = await fastify.listen({ port: 5050 });

globalThis.console.log(`Server listening at ${address}`);
