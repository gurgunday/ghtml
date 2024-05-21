import { htmlAsyncGenerator as html } from "ghtml";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import http from "node:http";

const asyncGenerator = async function* () {
  const Hello = await new Promise((resolve) => {
    setTimeout(() => {
      resolve("Hello");
    }, 1000);
  });
  yield `${Hello}!`;
};

http
  .createServer((req, res) => {
    const htmlContent = html`<html>
      <p>${asyncGenerator()}</p>
      <code>${readFile("./README.md", "utf8")}</code>
      <code>${createReadStream("./README.md", "utf8")}</code>
    </html>`;
    const readableStream = Readable.from(htmlContent);
    res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
    readableStream.pipe(res);
  })
  .listen(3000);
