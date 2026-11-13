/**
 * Cloudflare Stream playback configuration.
 *
 * - `stream-ids.json` maps each film key to its Stream video UID. It is written by
 *   `npm run stream:upload` and committed: UIDs are public identifiers, not secrets.
 * - NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE is the account's playback subdomain code
 *   (Stream dashboard → any video → the "customer-xxxx.cloudflarestream.com" host).
 *   It is public by design; the API token never reaches the browser.
 * - NEXT_PUBLIC_STREAM_IDS (optional, JSON) overrides individual UIDs per environment.
 */
import fileIds from "./stream-ids.json";

const customerCode = process.env.NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE ?? "";

let envIds: Record<string, string> = {};
try {
  envIds = JSON.parse(process.env.NEXT_PUBLIC_STREAM_IDS || "{}");
} catch {
  envIds = {};
}

const ids: Record<string, string> = { ...(fileIds as Record<string, string>), ...envIds };

export type StreamSource = { hls: string; thumbnail: string };

export function streamFor(key: string): StreamSource | null {
  const uid = ids[key];
  if (!uid || !customerCode) return null;
  const base = `https://customer-${customerCode}.cloudflarestream.com/${uid}`;
  return {
    hls: `${base}/manifest/video.m3u8`,
    thumbnail: `${base}/thumbnails/thumbnail.jpg?time=2s&height=1280`,
  };
}

export const streamConfigured = () => customerCode !== "" && Object.keys(ids).length > 0;
