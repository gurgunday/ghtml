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

// Routes
fastify.register(import("./routes/index.js"));

fastify.listen({ port: 5050 }, (err) => {
  if (err) {
    throw err;
  }

  console.warn("Server listening at http://localhost:5050");
});
