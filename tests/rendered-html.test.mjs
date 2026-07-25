import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the Panzi introduction page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Panzi \| AI Smart Pantry<\/title>/i);
  assert.match(html, /Less waste\./);
  assert.match(html, /AI image recognition/);
  assert.match(html, /From grocery bag/);
  assert.match(html, /hello@panzi\.app/);
  assert.doesNotMatch(html, /In development/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
