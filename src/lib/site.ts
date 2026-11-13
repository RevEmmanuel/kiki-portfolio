/**
 * Where the site lives and whether search engines may index it.
 *
 * NEXT_PUBLIC_SITE_URL      canonical origin, e.g. https://kikiwilliams.com (set once the domain is confirmed)
 * NEXT_PUBLIC_ALLOW_INDEXING "true" only at launch; every other deployment is noindex
 *
 * Without NEXT_PUBLIC_SITE_URL, Vercel's production URL (or the preview URL) is used, so previews
 * still produce working absolute URLs for Open Graph without pointing canonicals at a guessed domain.
 */
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/$/, "");

export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const abs = (path: string) => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

/** Open Graph for a page that uses the site-wide share image. */
export const pageOg = (title: string, url: string) => ({
  title: `${title} — Kiki Williams`,
  url,
  type: "website" as const,
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Kiki Williams — Videographer / Photographer / Creator" }],
});
