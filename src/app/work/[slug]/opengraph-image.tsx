import { bySlug, projects } from "@/content/projects";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Kiki Williams project";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug)!;
  const ph = p.photos[0];
  const kind = p.medium === "film" ? "Film" : p.medium === "both" ? "Photographs and film" : "Photographs";
  return ogCard({
    title: p.title,
    kicker: `${kind} · ${p.categories[0] ?? ""}`,
    bd: p.backdrop,
    on: p.on,
    image: ph?.src ?? p.films[0]?.poster ?? null,
    ratio: ph ? ph.w / ph.h : 9 / 16,
  });
}
