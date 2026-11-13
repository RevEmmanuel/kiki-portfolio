/**
 * npm run media — builds the site's media from the original Drive masters.
 *
 *   MEDIA_SRC=~/Downloads/kiki-originals npm run media
 *
 * MEDIA_SRC is any folder holding the originals (for example the Drive folders downloaded
 * as zips and unpacked). Files are matched by their exact Drive filename, recursively, so
 * folder layout does not matter. Nothing in MEDIA_SRC is modified.
 *
 * Photos  → public/media/photo/<name>.jpg, long edge 2400 px, EXIF orientation applied,
 *           all metadata (GPS, camera serials) stripped. Next/Image serves AVIF/WebP from these.
 * Films   → public/media/film/<key>.jpg poster (1080 px wide) and <key>-loop.mp4
 *           (6 s, silent, 540×960, H.264, faststart) for the in-page previews.
 * Both    → src/content/media.generated.json with measured sizes and durations.
 *
 * Withheld material (src/content/withheld.ts) is never processed.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { projects } from "../src/content/projects";
import { withheld } from "../src/content/withheld";

const root = resolve(__dirname, "..");
const srcDir = (process.env.MEDIA_SRC ?? "").replace(/^~/, homedir());
if (!srcDir || !existsSync(srcDir)) {
  console.error("Set MEDIA_SRC to the folder that holds the original files.");
  process.exit(1);
}

// Optional per-film timing: { "<key>": { "posterAt": 2.5, "loopAt": 4 } }
const timingFile = join(root, "scripts/film-timing.json");
const timing: Record<string, { posterAt?: number; loopAt?: number }> = existsSync(timingFile) ? JSON.parse(readFileSync(timingFile, "utf8")) : {};

const index = new Map<string, string[]>();
(function walk(d: string) {
  for (const n of readdirSync(d)) {
    if (n.startsWith(".")) continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else index.set(n, [...(index.get(n) ?? []), p]);
  }
})(srcDir);

const probe = (path: string) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).toString().trim());
const secs = (mmss: string) => mmss.split(":").reduce((a, b) => a * 60 + Number(b), 0);

/**
 * Find an original by exact filename. Drive sometimes holds two files with the same name
 * (Black Chedder has two "Cheddar.MOV"): then the one whose running time matches the content
 * model is chosen, so each film keeps its own master.
 */
function find(file: string, duration?: string): string | null {
  const hits = index.get(file) ?? index.get(file.replace(/ /g, "_")) ?? [];
  if (hits.length <= 1 || !duration) return hits[0] ?? null;
  const want = secs(duration);
  return [...hits].sort((a, b) => Math.abs(probe(a) - want) - Math.abs(probe(b) - want))[0];
}

const blocked = new Set(withheld.flatMap((w) => w.files));
const genPath = join(root, "src/content/media.generated.json");
const gen = JSON.parse(readFileSync(genPath, "utf8")) as {
  photos: Record<string, { w: number; h: number }>;
  films: Record<string, { poster?: string; loop?: string; duration?: string }>;
};
const missing: string[] = [];
const ff = (args: string[]) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

async function main() {
  mkdirSync(join(root, "public/media/photo"), { recursive: true });
  mkdirSync(join(root, "public/media/film"), { recursive: true });

  for (const p of projects) {
    for (const ph of p.photos) {
      if (blocked.has(ph.file)) throw new Error(`${ph.file} is withheld`);
      const from = find(ph.file);
      if (!from) {
        missing.push(`${p.title}: ${ph.file}`);
        continue;
      }
      const out = join(root, "public", ph.src);
      const info = await sharp(from)
        .rotate() // apply EXIF orientation, then drop it
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .toColourspace("srgb")
        .jpeg({ quality: 86, mozjpeg: true, progressive: true })
        .toFile(out); // sharp strips metadata unless asked to keep it
      gen.photos[ph.src] = { w: info.width, h: info.height };
      console.log(`photo  ${ph.file} → ${ph.src} ${info.width}×${info.height}`);
    }

    for (const f of p.films) {
      if (blocked.has(f.file)) throw new Error(`${f.file} is withheld`);
      const from = find(f.file, f.duration);
      if (!from) {
        missing.push(`${p.title}: ${f.file}`);
        continue;
      }
      const dur = probe(from);
      const t = timing[f.key] ?? {};
      const posterAt = Math.min(t.posterAt ?? Math.min(2, dur / 3), Math.max(0, dur - 0.5));
      const loopAt = Math.min(t.loopAt ?? posterAt, Math.max(0, dur - 6));
      const poster = `/media/film/${f.key}.jpg`;
      const loop = `/media/film/${f.key}-loop.mp4`;
      ff(["-ss", String(posterAt), "-i", from, "-frames:v", "1", "-vf", "scale=1080:-2", "-q:v", "3", join(root, "public", poster)]);
      ff(["-ss", String(loopAt), "-t", "6", "-i", from, "-an", "-vf", "scale=540:-2,fps=30", "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(root, "public", loop)]);
      gen.films[f.key] = { poster, loop, duration: mmss(dur) };
      console.log(`film   ${f.file} → ${poster}, ${loop} (${mmss(dur)})`);
    }
  }

  writeFileSync(genPath, JSON.stringify(gen, null, 2) + "\n");
  if (missing.length) {
    console.warn(`\nNot found in MEDIA_SRC (left as they were):\n  ${missing.join("\n  ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
