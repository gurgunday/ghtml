import { html } from "../src/html.js";
import { Bench } from "tinybench";

const bench = new Bench();

const safeOutput = "This is safe content!".repeat(250);
const unsafeOutput =
  "<script>alert('This is unsafe content!');</script>".repeat(50);

bench.add("test raw", () => {
  return html`
    <div>
      <p>
        <span>test1</span>
        !${safeOutput} !${true} !${1} !${1n} !${1.1} !${1.1} !${null}
        !${undefined} !${Number.NaN} !${Number.Infinity} !${-Number.Infinity}
        !${unsafeOutput}
      </p>
    </div>
  `;
});

bench.add("test escape", () => {
  return html`
    <div>
      <p>
        <span>test1</span>
        ${safeOutput} ${true} ${1} ${1n} ${1.1} ${1.1} ${null} ${undefined}
        ${Number.NaN} ${Number.Infinity} ${-Number.Infinity} ${unsafeOutput}
      </p>
    </div>
  `;
});

await bench.warmup();
console.table(await bench.run());
