import test from "node:test";
import assert from "node:assert";
import { html, htmlGenerator } from "../src/index.js";

const username = "Paul";
const descriptionSafe = "This is a safe description.";
const descriptionUnsafe =
  "<script>alert('This is an unsafe description.')</script>";
const array1 = [1, 2, 3, 4, 5];
const conditionTrue = true;
const conditionFalse = false;
const emptyString = "";

const generatorExample = function* () {
  yield "<p>";
  yield descriptionSafe;
  yield descriptionUnsafe;
  yield array1;
  yield null;
  yield 255;
  yield "</p>";
};

test("renders empty input", () => {
  assert.strictEqual(html({ raw: [""] }), "");
});

test("renders empty input", () => {
  assert.strictEqual(html`${emptyString}`, "");
});

test("renders normal input", () => {
  assert.strictEqual(html`Hey, ${username}!`, `Hey, ${username}!`);
});

test("renders safe content", () => {
  assert.strictEqual(
    html`<p>${descriptionSafe}</p>`,
    "<p>This is a safe description.</p>",
  );
});

test("escapes unsafe content", () => {
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

test("bypass escaping", () => {
  assert.strictEqual(
    html`<p>!${[descriptionSafe, descriptionUnsafe]}</p>`,
    "<p>This is a safe description.<script>alert('This is an unsafe description.')</script></p>",
  );
});

test("renders wrapped html calls", () => {
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
  const generator = htmlGenerator`<p>${descriptionSafe}!${descriptionSafe}G!${htmlGenerator`${array1}`}!${null}${255}</p>`;
  assert.strictEqual(generator.next().value, "<p>This is a safe description.");
  assert.strictEqual(generator.next().value, "This is a safe description.");
  assert.strictEqual(generator.next().value, "G");
  assert.strictEqual(generator.next().value, "12345");
  assert.strictEqual(generator.next().value, "255");
  assert.strictEqual(generator.next().value, "</p>");
  assert.strictEqual(generator.next().done, true);
});

test("htmlGenerator escapes unsafe content", () => {
  const generator = htmlGenerator`<p>${descriptionUnsafe}${descriptionUnsafe}${htmlGenerator`${array1}`}${null}${255}</p>`;
  assert.strictEqual(
    generator.next().value,
    "<p>&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;",
  );
  assert.strictEqual(
    generator.next().value,
    "&lt;script&gt;alert(&apos;This is an unsafe description.&apos;)&lt;/script&gt;",
  );
  assert.strictEqual(generator.next().value, "12345");
  assert.strictEqual(generator.next().value, "255");
  assert.strictEqual(generator.next().value, "</p>");
  assert.strictEqual(generator.next().done, true);
});

test("htmlGenerator works with other generators", () => {
  const generator = htmlGenerator`<div>!${generatorExample()}</div>`;
  assert.strictEqual(generator.next().value, "<div>");
  assert.strictEqual(generator.next().value, "<p>");
  assert.strictEqual(generator.next().value, "This is a safe description.");
  assert.strictEqual(
    generator.next().value,
    "<script>alert('This is an unsafe description.')</script>",
  );
  assert.strictEqual(generator.next().value, "12345");
  assert.strictEqual(generator.next().value, "255");
  assert.strictEqual(generator.next().value, "</p>");
  assert.strictEqual(generator.next().value, "</div>");
  assert.strictEqual(generator.next().done, true);
});
