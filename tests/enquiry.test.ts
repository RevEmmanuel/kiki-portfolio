import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { clean, escapeHtml, validate } from "../src/lib/enquiry";

const good = { name: "Ada Obi", email: "Ada@Example.com", message: "A launch film for a skincare brand.", service: "Film" };

describe("validate", () => {
  it("accepts a complete enquiry and normalises it", () => {
    const { data, errors } = validate({ ...good, phone: "+234 818 000 0000", date: "2026-12-01", budget: "₦500k" });
    assert.equal(errors, undefined);
    assert.equal(data!.email, "ada@example.com");
    assert.equal(data!.service, "Film");
  });
  it("reports each bad field", () => {
    const { errors } = validate({ name: "A", email: "nope", message: "hi", phone: "call me", date: "tomorrow", service: "Hack" });
    assert.deepEqual(Object.keys(errors!).sort(), ["date", "email", "message", "name", "phone", "service"]);
  });
  it("treats optional fields as optional", () => {
    assert.ok(validate(good).data);
  });
  it("rejects header-injection style emails", () => {
    assert.ok(validate({ ...good, email: "a@b.co\nBcc: x@y.z" }).errors?.email);
  });
});

describe("sanitising", () => {
  it("strips control characters and collapses whitespace", () => {
    assert.equal(clean("  Ada\u0000\u0007   Obi \n", 100), "Ada Obi");
    assert.equal(clean("line one\n\n\n\nline two", 100, true), "line one\n\nline two");
  });
  it("caps length", () => assert.equal(clean("x".repeat(500), 100).length, 100));
  it("escapes HTML", () => assert.equal(escapeHtml(`<img src=x onerror="a">'`), "&lt;img src=x onerror=&quot;a&quot;&gt;&#39;"));
});

describe("POST /api/enquiry", () => {
  let sent: { url: string; body: Record<string, unknown> }[] = [];
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    sent = [];
    process.env.RESEND_API_KEY = "re_test_key";
    globalThis.fetch = mock.fn(async (url: string, init: RequestInit) => {
      sent.push({ url, body: JSON.parse(String(init.body)) });
      return new Response(JSON.stringify({ id: "1" }), { status: 200 });
    }) as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  let ip = 0;
  const post = async (body: unknown, headers: Record<string, string> = {}) => {
    const { POST } = await import("../src/app/api/enquiry/route");
    return POST(
      new Request("http://site.test/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json", host: "site.test", "x-forwarded-for": `10.0.0.${++ip}`, ...headers },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    );
  };
  const started = () => Date.now() - 10_000;

  it("sends one escaped email to Kiki with reply-to set", async () => {
    const res = await post({ ...good, name: "Ada <b>", startedAt: started() });
    assert.equal(res.status, 200);
    assert.equal(sent.length, 1);
    assert.deepEqual(sent[0].body.to, ["kikiwill7.kw@gmail.com"]);
    assert.equal(sent[0].body.reply_to, "ada@example.com");
    assert.ok(String(sent[0].body.html).includes("Ada &lt;b&gt;"));
  });
  it("returns field errors", async () => {
    const res = await post({ name: "", email: "x", message: "", startedAt: started() });
    assert.equal(res.status, 400);
    assert.ok((await res.json()).fields.email);
    assert.equal(sent.length, 0);
  });
  it("quietly drops honeypot and too-fast submissions", async () => {
    assert.equal((await post({ ...good, website: "spam", startedAt: started() })).status, 200);
    assert.equal((await post({ ...good, startedAt: Date.now() })).status, 200);
    assert.equal(sent.length, 0);
  });
  it("rejects other origins and bad JSON", async () => {
    assert.equal((await post({ ...good, startedAt: started() }, { origin: "https://evil.example" })).status, 403);
    assert.equal((await post("{nope")).status, 400);
  });
  it("rate-limits one connection", async () => {
    const codes = [];
    for (let i = 0; i < 6; i++) codes.push((await post({ ...good, email: `r${i}@x.co`, startedAt: started() }, { "x-forwarded-for": "9.9.9.9" })).status);
    assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
  });
  it("says so when the key is missing, and when Resend fails", async () => {
    delete process.env.RESEND_API_KEY;
    assert.equal((await post({ ...good, email: "k@x.co", startedAt: started() })).status, 503);
    process.env.RESEND_API_KEY = "re_test_key";
    globalThis.fetch = (async () => new Response("bad", { status: 500 })) as unknown as typeof fetch;
    assert.equal((await post({ ...good, email: "f@x.co", startedAt: started() })).status, 502);
  });
});
