export default async (fastify) => {
  const { html } = fastify;

  fastify.addLayout((inner) => {
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
        </head>
        <body>
          !${inner}
        </body>
      </html>`;
  });

  fastify.get("/", async (request, reply) => {
    return reply.html`
      <h1 class="caption">Hello, world!</h1>
      <script src="/p/assets/script.js"></script>
    `;
  });
};
