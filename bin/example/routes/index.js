import { html } from "ghtml";

export default async (fastify) => {
  fastify.decorateReply("html", function (inner) {
    this.type("text/html; charset=utf-8");

    return html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Document</title>
          <link rel="stylesheet" href="/p/assets/style.css" />
          <script src="/p/assets/script.js"></script>
        </head>
        <body>
          !${inner}
        </body>
      </html>`;
  });

  fastify.get("/", async (request, reply) => {
    return reply.html(html`
      <h1 class="caption">Hello, world!</h1>
      <p>This is a simple example of a Fastify server.</p>
      <p>It uses <code>ghtml</code>.</p>
    `);
  });
};
