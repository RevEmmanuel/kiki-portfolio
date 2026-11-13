import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookBand } from "@/components/Closing";
import { NextProject, ProjectHero, ProjectSequence } from "@/components/ProjectBody";
import { bySlug, nextProject, projects, type Project } from "@/content/projects";
import { streamFor } from "@/content/stream";
import { abs, siteUrl } from "@/lib/site";

const iso = (d: string) => {
  const [m, s] = d.split(":").map(Number);
  return `PT${m ? `${m}M` : ""}${s}S`;
};

function projectLd(p: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.summary,
    url: abs(`/work/${p.slug}`),
    genre: p.categories,
    creator: { "@type": "Person", "@id": `${siteUrl}/#kiki`, name: "Kiki Williams" },
    image: p.photos.map((ph) => ({ "@type": "ImageObject", contentUrl: abs(ph.src), width: ph.w, height: ph.h, caption: ph.alt })),
    video: p.films.map((f) => {
      const s = streamFor(f.key);
      return {
        "@type": "VideoObject",
        name: f.title,
        description: `${f.title}, a film by Kiki Williams.`,
        duration: iso(f.duration),
        thumbnailUrl: f.poster ? abs(f.poster) : undefined,
        contentUrl: s?.hls,
      };
    }),
  };
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  const kind = p.medium === "film" ? "film" : p.medium === "both" ? "photographs and film" : "photographs";
  return {
    title: `${p.title}, ${kind}`,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { type: "article", title: `${p.title} — Kiki Williams`, description: p.summary, url: `/work/${p.slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectLd(p)).replace(/</g, "\\u003c") }} />
      <ProjectHero p={p} />
      <ProjectSequence p={p} />
      <NextProject next={nextProject(p.slug)} />
      <BookBand />
    </>
  );
}
