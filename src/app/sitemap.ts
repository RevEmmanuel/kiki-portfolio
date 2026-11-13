import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { abs } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/work", "/films", "/services", "/about", "/contact"].map((path, i) => ({
    url: abs(path),
    changeFrequency: "monthly" as const,
    priority: i === 0 ? 1 : 0.8,
  }));
  const work = projects.map((p) => ({
    url: abs(`/work/${p.slug}`),
    changeFrequency: "yearly" as const,
    priority: 0.6,
    images: p.photos.slice(0, 6).map((ph) => abs(ph.src)),
  }));
  return [...pages, ...work];
}
