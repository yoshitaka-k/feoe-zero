import { assertEquals } from "@std/assert";
import { handler } from "../src/handler.ts";

Deno.test("returns html on /", async () => {
  const res = await handler(new Request("http://localhost/"));
  assertEquals(res.headers.get("content-type"), "text/html; charset=utf-8");
  const body = await res.text();
  assertEquals(body.includes("Welcome to Deno"), true);
});

Deno.test("returns json on /api", async () => {
  const res = await handler(new Request("http://localhost/api"));
  const data = await res.json();
  assertEquals(data.message, "Hello, world!!");
  assertEquals(typeof data.time, "string");
});

Deno.test("serves css from /assets", async () => {
  const res = await handler(
    new Request("http://localhost/assets/css/reset.css"),
  );
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("content-type"), "text/css; charset=utf-8");
  const body = await res.text();
  assertEquals(body.includes("* { box-sizing: border-box; }"), true);
});

Deno.test("returns 404 for missing assets", async () => {
  const res = await handler(
    new Request("http://localhost/assets/css/missing.css"),
  );
  assertEquals(res.status, 404);
});

Deno.test("blocks path traversal in /assets", async () => {
  const res = await handler(
    new Request("http://localhost/assets/css%2f..%2f..%2fmain.ts"),
  );
  assertEquals(res.status, 404);
});
