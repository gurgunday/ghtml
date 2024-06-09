import { html, htmlGenerator, htmlAsyncGenerator } from "../src/index.js";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert";

const conditionTrue = true;
const conditionFalse = false;
const username = "Paul";
const descriptionSafe = "This is a safe description.";
const descriptionUnsafe =
  "<script>alert('This is an unsafe description.')</script>";
const array1 = [1, 2, 3, 4, 5];

const generatorExample = function* () {
  yield "<p>";
  yield descriptionSafe;
  yield descriptionUnsafe;
  yield array1;
  yield null;
  yield 255;
  yield "</p>";
};

const generatorPromiseExample = function* () {
  yield [
    new Promise((resolve) => {
      resolve("<p>");
    }),
    null,
    12n,
  ];
  yield;
};

test("renders empty input", () => {
  assert.strictEqual(html({ raw: [""] }), "");
});

test("renders empty input", () => {
  assert.strictEqual(html`${""}`, "");
});

test("renders normal input", () => {
  assert.strictEqual(html`Hey, ${username}!`, `Hey, ${username}!`);
});

test("renders undefined and null as empty string", () => {
  assert.strictEqual(html`<p>${null}${undefined}</p>`, "<p></p>");
});

test("renders safe content", () => {
  assert.strictEqual(
    html`<p>${descriptionSafe}</p>`,
    "<p>This is a safe description.</p>",
  );
});

test("renders unsafe content", () => {
  assert.strictEqual(
    html`<p>${descriptionUnsafe}</p>`,
    `<p>&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;</p>`,
  );
});

test("renders arrays", () => {
  assert.strictEqual(
    html`<p>${[descriptionSafe, descriptionUnsafe]}</p>`,
    "<p>This is a safe description.&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;</p>",
  );
});

test("bypasses escaping", () => {
  assert.strictEqual(
    html`<p>!${[descriptionSafe, descriptionUnsafe]}</p>`,
    "<p>This is a safe description.<script>alert('This is an unsafe description.')</script></p>",
  );
});

test("renders nested html calls", () => {
  // prettier-ignore
  assert.strictEqual(
    html`<p>!${conditionTrue ? html`<strong>${descriptionUnsafe}</strong>` : ""}</p>`,
    "<p><strong>&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;</strong></p>",
  );
});

test("renders multiple html calls", () => {
  assert.strictEqual(
    html`
      <p>
        !${conditionFalse ? "" : html`<strong> ${descriptionSafe} </strong>`}
        <em> ${array1} </em>
        !${conditionFalse ? html`<em> ${array1} </em>` : ""}
      </p>
    `,
    `
      <p>
        <strong> This is a safe description. </strong>
        <em> 12345 </em>
        
      </p>
    `,
  );
});

test("renders multiple html calls with different expression types", () => {
  const obj = {};
  obj.toString = () => {
    return "description of the object";
  };

  // prettier-ignore
  assert.strictEqual(
    html`
      <p>
        !${conditionTrue ? html`<strong> ${descriptionSafe} </strong>` : ""}
        !${conditionFalse
          ? ""
          :
            html`<em> ${array1.map((i) => {return i + 1;})} </em>`}<br />
        And also, ${false} ${null}${undefined}${obj} is ${true}
      </p>
    `,
    `
      <p>
        <strong> This is a safe description. </strong>
        <em> 23456 </em><br />
        And also, false description of the object is true
      </p>
    `,
  );
});

test("htmlGenerator renders safe content", () => {
  const generator = htmlGenerator`<p>${descriptionSafe}!${descriptionUnsafe}G!${htmlGenerator`${array1}`}!${null}${255}</p>`;
  let accumulator = "";

  for (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<p>This is a safe description.<script>alert('This is an unsafe description.')</script>G12345255</p>",
  );
});

test("htmlGenerator renders unsafe content", () => {
  const generator = htmlGenerator`<p>${descriptionSafe}${descriptionUnsafe}${htmlGenerator`${array1}`}${null}${255}</p>`;
  let accumulator = "";

  for (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<p>This is a safe description.&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;12345255</p>",
  );
});

test("htmlGenerator works with nested htmlGenerator calls in an array", () => {
  const generator = htmlGenerator`<ul>!${[1, 2, 3].map((index) => {
    return htmlGenerator`<li>${index}</li>`;
  })}</ul>`;
  let accumulator = "";

  for (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(accumulator, "<ul><li>1</li><li>2</li><li>3</li></ul>");
  assert.strictEqual(generator.next().done, true);
});

test("htmlGenerator works with other generators (raw)", () => {
  const generator = htmlGenerator`<div>!${generatorExample()}</div>`;
  let accumulator = "";

  for (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<div><p>This is a safe description.<script>alert('This is an unsafe description.')</script>12345255</p></div>",
  );
  assert.strictEqual(generator.next().done, true);
});

test("htmlGenerator works with other generators (escaped)", () => {
  const generator = htmlGenerator`<div>${generatorExample()}</div>`;
  let accumulator = "";

  for (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<div>&lt;p&gt;This is a safe description.&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;12345255&lt;/p&gt;</div>",
  );
  assert.strictEqual(generator.next().done, true);
});

test("htmlGenerator works with other generators within an array (raw)", () => {
  const generator = htmlGenerator`<div>!${[generatorExample()]}</div>`;
  let accumulator = "";

  for (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<div><p>This is a safe description.<script>alert('This is an unsafe description.')</script>1,2,3,4,5255</p></div>",
  );
  assert.strictEqual(generator.next().done, true);
});

test("htmlGenerator works with other generators within an array (escaped)", () => {
  const generator = htmlGenerator`<div>${[generatorExample()]}</div>`;
  let accumulator = "";

  for (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<div>&lt;p&gt;This is a safe description.&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;1,2,3,4,5255&lt;/p&gt;</div>",
  );
  assert.strictEqual(generator.next().done, true);
});

test("htmlAsyncGenerator renders safe content", async () => {
  const generator = htmlAsyncGenerator`<p>${descriptionSafe}!${descriptionUnsafe}G!${htmlAsyncGenerator`${array1}`}!${null}${255}</p>`;
  let accumulator = "";

  for await (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<p>This is a safe description.<script>alert('This is an unsafe description.')</script>G12345255</p>",
  );
});

test("htmlAsyncGenerator renders unsafe content", async () => {
  const generator = htmlAsyncGenerator`<p>${descriptionSafe}${descriptionUnsafe}${htmlAsyncGenerator`${array1}`}${null}${255}</p>`;
  let accumulator = "";

  for await (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<p>This is a safe description.&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;12345255</p>",
  );
});

test("htmlAsyncGenerator works with other generators (raw)", async () => {
  const generator = htmlAsyncGenerator`<div>!${generatorExample()}</div>`;
  let accumulator = "";

  for await (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<div><p>This is a safe description.<script>alert('This is an unsafe description.')</script>12345255</p></div>",
  );
});

test("htmlAsyncGenerator works with other generators (escaped)", async () => {
  const generator = htmlAsyncGenerator`<div>${generatorExample()}</div>`;
  let accumulator = "";

  for await (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator,
    "<div>&lt;p&gt;This is a safe description.&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;12345255&lt;/p&gt;</div>",
  );
});

test("htmlAsyncGenerator works with nested htmlAsyncGenerator calls in an array", async () => {
  const generator = htmlAsyncGenerator`!${[1, 2, 3].map((i) => {
    return htmlAsyncGenerator`${i}: <p>${readFile("test/test.md", "utf8")}</p>`;
  })}`;
  let accumulator = "";

  for await (const value of generator) {
    accumulator += value;
  }

  assert.strictEqual(
    accumulator.replaceAll("\n", "").trim(),
    "1: <p># test.md&gt;</p>2: <p># test.md&gt;</p>3: <p># test.md&gt;</p>",
  );
});

test("htmlAsyncGenerator renders chunks with promises (escaped)", async () => {
  const generator = htmlAsyncGenerator`<ul>!${[1, 2].map((i) => {
    return htmlAsyncGenerator`${i}: ${readFile("test/test.md", "utf8")}`;
  })}</ul>`;
  const fileContent = readFileSync("test/test.md", "utf8").replaceAll(
    ">",
    "&gt;",
  );

  let value = await generator.next();
  assert.strictEqual(value.value, "<ul>");

  value = await generator.next();
  assert.strictEqual(value.value, `1`);

  value = await generator.next();
  assert.strictEqual(value.value, `: ${fileContent}`);

  value = await generator.next();
  assert.strictEqual(value.value, `2`);

  value = await generator.next();
  assert.strictEqual(value.value, `: ${fileContent}`);

  value = await generator.next();
  assert.strictEqual(value.value, "</ul>");

  value = await generator.next();
  assert.strictEqual(value.done, true);
});

test("htmlAsyncGenerator renders chunks with promises (raw)", async () => {
  const generator = htmlAsyncGenerator`<ul>!${[1, 2].map((i) => {
    return htmlAsyncGenerator`${i}: !${readFile("test/test.md", "utf8")}`;
  })}</ul>`;
  const fileContent = readFileSync("test/test.md", "utf8");

  let value = await generator.next();
  assert.strictEqual(value.value, "<ul>");

  value = await generator.next();
  assert.strictEqual(value.value, `1`);

  value = await generator.next();
  assert.strictEqual(value.value, `: ${fileContent}`);

  value = await generator.next();
  assert.strictEqual(value.value, `2`);

  value = await generator.next();
  assert.strictEqual(value.value, `: ${fileContent}`);

  value = await generator.next();
  assert.strictEqual(value.value, "</ul>");

  value = await generator.next();
  assert.strictEqual(value.done, true);
});

test("htmlAsyncGenerator redners in chuncks", async () => {
  const generator = htmlAsyncGenerator`<ul>${generatorPromiseExample()}</ul>`;

  let value = await generator.next();
  assert.strictEqual(value.value, "<ul>");

  value = await generator.next();
  assert.strictEqual(value.value, "&lt;p&gt;");

  value = await generator.next();
  assert.strictEqual(value.value, "12");

  value = await generator.next();
  assert.strictEqual(value.value, "</ul>");

  value = await generator.next();
  assert.strictEqual(value.done, true);
});

test("htmlAsyncGenerator redners in chuncks (raw)", async () => {
  const generator = htmlAsyncGenerator`<ul>!${generatorPromiseExample()}</ul>`;

  let value = await generator.next();
  assert.strictEqual(value.value, "<ul>");

  value = await generator.next();
  assert.strictEqual(value.value, "<p>");

  value = await generator.next();
  assert.strictEqual(value.value, "12");

  value = await generator.next();
  assert.strictEqual(value.value, "</ul>");

  value = await generator.next();
  assert.strictEqual(value.done, true);
});
