import { bySlug } from "@/content/projects";
import { ogCard, ogSize } from "@/lib/og";

export const alt = "Kiki Williams — Videographer / Photographer / Creator";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const lead = bySlug("glitz")!;
  const ph = lead.photos[0];
  return ogCard({ title: "Kiki Williams", kicker: "Videographer / Photographer / Creator", bd: lead.backdrop, on: lead.on, image: ph.src, ratio: ph.w / ph.h, brand: false });
}
