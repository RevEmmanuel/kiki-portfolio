/**
 * npm run stream:upload — puts each published film on Cloudflare Stream and records its UID.
 *
 *   CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_STREAM_API_TOKEN=… [MEDIA_SRC=…] npm run stream:upload
 *
 * For each film not yet in src/content/stream-ids.json:
 *   - if MEDIA_SRC holds the master (exact Drive filename), it is uploaded directly;
 *   - otherwise Stream copies it from the public Drive download link.
 * Then it waits until Stream reports the video ready, writes stream-ids.json and prints the
 * customer code to put in NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE.
 *
 * The token needs only "Stream: Edit" on this account. It is read from the environment,
 * never written to disk, and never reaches the website.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { allFilms } from "../src/content/projects";
import { withheld } from "../src/content/withheld";

const root = resolve(__dirname, "..");
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
if (!account || !token) {
  console.error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN.");
  process.exit(1);
}
const api = `https://api.cloudflare.com/client/v4/accounts/${account}/stream`;
const auth = { Authorization: `Bearer ${token}` };
const idsPath = join(root, "src/content/stream-ids.json");
const ids: Record<string, string> = JSON.parse(readFileSync(idsPath, "utf8"));
const blocked = new Set(withheld.flatMap((w) => [...w.files, ...w.driveIds]));

const index = new Map<string, string>();
const srcDir = (process.env.MEDIA_SRC ?? "").replace(/^~/, homedir());
if (srcDir && existsSync(srcDir)) {
  (function walk(d: string) {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (!index.has(n)) index.set(n, p);
    }
  })(srcDir);
}

type Video = { uid: string; readyToStream: boolean; status: { state: string; errorReasonText?: string }; playback?: { hls?: string } };

async function cf<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${api}${path}`, { ...init, headers: { ...auth, ...(init.headers ?? {}) } });
  const body = (await res.json()) as { success: boolean; errors: { message: string }[]; result: T };
  if (!body.success) throw new Error(`${path}: ${body.errors.map((e) => e.message).join("; ")}`);
  return body.result;
}

async function upload(f: (typeof allFilms)[number]): Promise<Video> {
  const meta = { name: `${f.project.title} — ${f.title}`, key: f.key, file: f.file };
  const local = index.get(f.file);
  if (local) {
    const form = new FormData();
    form.append("file", new Blob([readFileSync(local)]), f.file);
    console.log(`upload ${f.file} (${(statSync(local).size / 1e6).toFixed(1)} MB)`);
    const v = await cf<Video>("", { method: "POST", body: form });
    await cf(`/${v.uid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meta }) });
    return v;
  }
  const url = `https://drive.usercontent.google.com/download?id=${f.driveId}&export=download&confirm=t`;
  console.log(`copy   ${f.file} from Drive`);
  return cf<Video>("/copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, meta }) });
}

async function main() {
  let customer = "";
  for (const f of allFilms) {
    if (blocked.has(f.file) || blocked.has(f.driveId)) throw new Error(`${f.file} is withheld`);
    if (ids[f.key]) continue;
    const v = await upload(f);
    ids[f.key] = v.uid;
    writeFileSync(idsPath, JSON.stringify(ids, null, 2) + "\n");
  }
  for (const [key, uid] of Object.entries(ids)) {
    for (let i = 0; ; i++) {
      const v = await cf<Video>(`/${uid}`);
      if (v.playback?.hls) customer = v.playback.hls.match(/customer-([a-z0-9]+)\./)?.[1] ?? customer;
      if (v.readyToStream) {
        console.log(`ready  ${key} ${uid}`);
        break;
      }
      if (v.status.state === "error") throw new Error(`${key}: ${v.status.errorReasonText}`);
      if (i > 120) throw new Error(`${key}: still processing after 20 minutes; run again later`);
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }
  console.log(`\nAll films ready. Set NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE=${customer || "<see Stream dashboard>"}`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
