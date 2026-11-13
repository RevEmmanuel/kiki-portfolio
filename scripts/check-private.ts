/**
 * npm run check:private — fails if withheld material or secrets could reach the public site.
 *
 * 1. No withheld Drive ID or filename appears in the published content, public/ or the build output.
 * 2. No server secret (Resend key, Cloudflare token) appears in anything sent to the browser.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { withheld } from "../src/content/withheld";

const root = resolve(__dirname, "..");
const needles = withheld.flatMap((w) => [...w.driveIds, ...w.files]);
const secrets = ["RESEND_API_KEY", "CLOUDFLARE_STREAM_API_TOKEN"].map((k) => process.env[k]).filter((v): v is string => !!v && v.length > 8);
const secretPatterns = [/\bre_[A-Za-z0-9]{16,}/]; // Resend key shape

const problems: string[] = [];
function scan(path: string, label: string, opts: { secrets: boolean }) {
  if (!existsSync(path)) return;
  const st = statSync(path);
  if (st.isDirectory()) {
    for (const n of readdirSync(path)) scan(join(path, n), `${label}/${n}`, opts);
    return;
  }
  for (const n of needles) if (label.includes(n)) problems.push(`withheld file name in path: ${label}`);
  if (st.size > 5_000_000 || /\.(jpe?g|png|webp|avif|mp4|woff2?|ttf)$/i.test(path)) return;
  const text = readFileSync(path, "utf8");
  for (const n of needles) if (text.includes(n)) problems.push(`withheld "${n}" in ${label}`);
  if (opts.secrets) {
    for (const s of secrets) if (text.includes(s)) problems.push(`server secret in ${label}`);
    for (const re of secretPatterns) if (re.test(text)) problems.push(`API key pattern in ${label}`);
  }
}

scan(join(root, "src/content/projects.ts"), "src/content/projects.ts", { secrets: true });
scan(join(root, "src/components"), "src/components", { secrets: true });
scan(join(root, "public"), "public", { secrets: true });
const dist = process.env.NEXT_DIST_DIR || ".next";
scan(join(root, dist, "static"), `${dist}/static`, { secrets: true }); // everything the browser downloads
scan(join(root, dist, "server/app"), `${dist}/server/app`, { secrets: false }); // prerendered HTML and RSC payloads

if (problems.length) {
  console.error(`check:private failed\n  ${[...new Set(problems)].join("\n  ")}`);
  process.exit(1);
}
console.log(`check:private ok — ${needles.length} withheld items absent, no secrets in client output`);
