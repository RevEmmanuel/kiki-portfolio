import { escapeHtml, summarise, validate } from "@/lib/enquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * POST /api/enquiry — validates, filters spam, rate-limits, then sends one email through Resend.
 *
 * Env (server only):
 *   RESEND_API_KEY        required to send
 *   ENQUIRY_TO_EMAIL      defaults to kikiwill7.kw@gmail.com
 *   ENQUIRY_FROM_EMAIL    a sender on a domain verified in Resend, e.g. "Kiki Williams website <enquiries@yourdomain>".
 *                         Until a domain is verified, "onboarding@resend.dev" works only when the Resend
 *                         account itself belongs to the recipient address.
 *   RESEND_API_URL        optional override (tests)
 */

const TO = process.env.ENQUIRY_TO_EMAIL || "kikiwill7.kw@gmail.com";
const FROM = process.env.ENQUIRY_FROM_EMAIL || "Kiki Williams website <onboarding@resend.dev>";
const API = process.env.RESEND_API_URL || "https://api.resend.com/emails";

const MAX_BODY = 16_000; // bytes
const MIN_FILL_MS = 3_000; // humans take longer than this to fill the form
const MAX_FILL_MS = 24 * 60 * 60 * 1000;

// Best-effort in-memory rate limit: 5 enquiries per IP per 10 minutes, 3 per email per hour.
// On Vercel this is per function instance; good enough against casual abuse without adding a database.
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear();
  return false;
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(request: Request) {
  // same-origin only
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json(403, { error: "Send the form from this website." });

  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_BODY) return json(413, { error: "That enquiry is too long. Shorten the message and try again." });

  let raw: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json(413, { error: "That enquiry is too long. Shorten the message and try again." });
    raw = JSON.parse(text);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("shape");
  } catch {
    return json(400, { error: "The form data couldn't be read. Reload the page and try again." });
  }

  // spam: hidden field filled, or submitted impossibly fast. Pretend success so bots learn nothing.
  const started = Number(raw.startedAt);
  const elapsed = Date.now() - started;
  if ((typeof raw.website === "string" && raw.website.trim() !== "") || !Number.isFinite(started) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return json(200, { ok: true });
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  if (limited(`ip:${ip}`, 5, 10 * 60 * 1000)) {
    return json(429, { error: "Too many enquiries from this connection. Wait a few minutes, or message Kiki on WhatsApp." }, { "Retry-After": "600" });
  }

  const { data, errors } = validate(raw);
  if (!data) return json(400, { error: "Check the highlighted fields.", fields: errors });

  if (limited(`email:${data.email}`, 3, 60 * 60 * 1000)) {
    return json(429, { error: "This email address has sent several enquiries already. Kiki will reply to those first." }, { "Retry-After": "3600" });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[enquiry] RESEND_API_KEY is not set");
    return json(503, { error: "Online enquiries aren't switched on yet. Send the same details on WhatsApp or by email." });
  }

  const text = summarise(data);
  const rows = (
    [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Service", data.service],
      ["Date", data.date],
      ["Budget", data.budget],
    ] as const
  )
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#6b6560">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
    .join("");
  const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#0d0c0b">
<p style="font-family:Arial,sans-serif;font-size:13px;color:#6b6560">New enquiry from the website</p>
<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">${rows}</table>
<p style="white-space:pre-wrap;margin-top:20px">${escapeHtml(data.message)}</p>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#6b6560">Reply to this email to answer ${escapeHtml(data.name)} directly.</p></div>`;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: data.email,
        subject: `Enquiry: ${data.service} — ${data.name}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[enquiry] Resend responded", res.status, (await res.text()).slice(0, 300));
      return json(502, { error: "The enquiry couldn't be delivered just now. Try again, or use WhatsApp or email." });
    }
  } catch (err) {
    console.error("[enquiry] send failed", err);
    return json(502, { error: "The enquiry couldn't be delivered just now. Try again, or use WhatsApp or email." });
  }

  return json(200, { ok: true });
}

export function GET() {
  return json(405, { error: "Use POST." }, { Allow: "POST" });
}
