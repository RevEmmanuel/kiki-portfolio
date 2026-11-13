"use client";

import Image from "next/image";
import Link from "next/link";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { allFilms, bySlug, projects, selectedWork, type Project } from "@/content/projects";
import { disciplines } from "@/content/services";
import { Section } from "../Backdrop";
import { Poster, useMedia } from "../Media";

/* ── Statement: type with pictures set inside the line, then real counts ── */

function Chip({ src, w = "1.6em" }: { src: string; w?: string }) {
  return (
    <span className="relative mx-[0.12em] inline-block h-[0.78em] overflow-hidden rounded-full align-[-0.02em]" style={{ width: w }}>
      <Image src={src} alt="" fill sizes="160px" className="object-cover" />
    </span>
  );
}

function Count({ to, label }: { to: number; label: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setN(to);
    const c = animate(0, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <div className="border-t-2 border-current pt-4">
      <p ref={ref} className="display text-[clamp(72px,9vw,150px)] leading-[0.85] tabular-nums">
        {String(n).padStart(2, "0")}
      </p>
      <p className="kicker mt-2">{label}</p>
    </div>
  );
}

export function Statement() {
  const g = bySlug("glitz")!.photos[0].src;
  const b = bySlug("bad-girl")!.photos[0].src;
  const s = bySlug("saskay")!.films[0].poster!;
  const photos = projects.reduce((n, p) => n + p.photos.length, 0);
  return (
    <Section bd="#efeae0" on="ink" label="Approach" className="px-[var(--gutter)] pb-24 pt-28 md:pt-36">
      <p className="kicker flex items-center gap-3">
        <span className="rec-dot" aria-hidden /> The approach
      </p>
      <h2 className="display mt-8 text-[clamp(52px,8.6vw,150px)] leading-[0.9]">
        One colour <Chip src={g} /> one light <Chip src={b} w="1.2em" /> one subject. <span className="accent text-signal">Then</span> it moves <Chip src={s} w="2em" />
      </h2>
      <div className="mt-14 grid gap-10 md:grid-cols-12">
        <p className="max-w-[40ch] text-[21px] leading-snug md:col-span-5 md:col-start-8 md:text-[23px]">
          The same eye makes the photograph and the film, so the stills feel like they could move, and the films hold still long
          enough to look at. Book one, or both on the same day.
        </p>
      </div>
      <div className="mt-20 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 md:grid-cols-4">
        <Count to={projects.length} label="Projects in the archive" />
        <Count to={photos} label="Photographs on the site" />
        <Count to={allFilms.length} label="Films on the site" />
        <Count to={disciplines.length} label="Disciplines" />
      </div>
    </Section>
  );
}

/* ── Selected work: an editorial spread, not a grid of cards ── */

const layout = [
  "md:col-span-7",
  "md:col-span-4 md:col-start-9 md:mt-[28vh]",
  "md:col-span-5 md:col-start-2",
  "md:col-span-5 md:col-start-8 md:mt-[16vh]",
  "md:col-span-4 md:col-start-1 md:mt-[6vh]",
  "md:col-span-6 md:col-start-6 md:mt-[22vh]",
];

function WorkCard({ p, n, className }: { p: Project; n: number; className: string }) {
  const { openFilm } = useMedia();
  const film = p.medium === "film" ? p.films[0] : null;
  const ph = p.photos[0];
  const ratio = film ? "9 / 14" : `${ph.w} / ${ph.h}`;
  const inner = (
    <>
      <span aria-hidden className="absolute inset-0 translate-x-0 translate-y-0 transition-transform duration-500 ease-[var(--ease)] group-hover:translate-x-3 group-hover:translate-y-3" style={{ background: p.backdrop }} />
      <span className="frame rise absolute inset-0 block">
        {film ? (
          <Poster film={film} sizes="(min-width: 768px) 45vw, 100vw" live />
        ) : (
          <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="transition-transform duration-[1400ms] ease-[var(--ease)] group-hover:scale-[1.05]" />
        )}
      </span>
    </>
  );
  return (
    <article className={`col-span-12 ${className}`}>
      {film ? (
        <button onClick={() => openFilm([{ ...film, project: p }], 0)} aria-label={`Play ${film.title}, ${film.duration}`} className="group relative block w-full" style={{ aspectRatio: ratio }}>
          {inner}
        </button>
      ) : (
        <Link href={`/work/${p.slug}`} aria-label={`Open ${p.title}`} className="group relative block w-full" style={{ aspectRatio: ratio }}>
          {inner}
        </Link>
      )}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="kicker opacity-60">
            {String(n).padStart(2, "0")} · {p.categories[0]}
          </p>
          <h3 className="display mt-1 text-[clamp(40px,4.6vw,76px)] leading-[0.9]">
            <Link href={`/work/${p.slug}`} className="hover:text-signal">
              {p.title}
            </Link>
          </h3>
        </div>
        <p className="kicker mt-1 shrink-0 rounded-full border border-current px-3 py-1.5">{p.medium === "both" ? "Photo + film" : p.medium === "photo" ? "Photo" : `Film ${film?.duration ?? ""}`}</p>
      </div>
    </article>
  );
}

export function Selected() {
  const work = selectedWork.map((s) => bySlug(s)!);
  return (
    <Section bd="#efeae0" on="ink" label="Selected work" className="px-[var(--gutter)] pb-32 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-t-2 border-current pt-6">
        <h2 className="display text-[clamp(64px,10vw,180px)] leading-[0.82]">
          Selected <span className="accent">work</span>
        </h2>
        <Link href="/work" className="cta">
          All {projects.length} projects →
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-12 gap-x-[var(--gutter)] gap-y-16 md:gap-y-0">
        {work.map((p, k) => (
          <WorkCard key={p.slug} p={p} n={k + 1} className={layout[k]} />
        ))}
      </div>
    </Section>
  );
}

/* ── Services teaser: five rows that open into colour ── */

export function ServicesTeaser() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section bd="#0d0c0b" on="paper" label="Services" className="px-[var(--gutter)] pb-28 pt-28">
      <div className="grid gap-8 md:grid-cols-12">
        <h2 className="display text-[clamp(64px,10vw,180px)] leading-[0.82] md:col-span-8">
          What she <span className="accent text-signal">makes</span>
        </h2>
        <p className="max-w-[34ch] self-end text-[19px] leading-snug opacity-85 md:col-span-4">
          Five disciplines, one way of seeing. Each one opens onto real work from the archive.
        </p>
      </div>
      <ul className="mt-14 border-b border-paper/20">
        {disciplines.map((d, k) => {
          const isOpen = open === k;
          const pics = d.work.map((s) => bySlug(s)!).map((p) => p.photos[0]?.src ?? p.films[0]?.poster).filter(Boolean).slice(0, 3) as string[];
          return (
            <li key={d.slug} className="border-t border-paper/20" onPointerEnter={() => setOpen(k)}>
              <button
                onClick={() => setOpen(isOpen ? null : k)}
                aria-expanded={isOpen}
                className="flex w-full items-baseline gap-4 py-5 text-left md:gap-8"
              >
                <span className="kicker w-8 shrink-0 opacity-60">{d.n}</span>
                <span className={`display text-[clamp(40px,6.4vw,110px)] leading-[0.88] transition-colors duration-300 ${isOpen ? "text-signal" : ""}`}>{d.name}</span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease)]" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <div className="grid gap-8 pb-8 md:grid-cols-12 md:pl-[calc(2rem+32px)]">
                    <div className="md:col-span-4">
                      <p className="text-[19px] leading-snug">{d.pitch}</p>
                      <Link href={`/services#${d.slug}`} className="kicker mt-6 inline-flex min-h-[44px] items-center gap-2 text-signal">
                        More on {d.line[1]} →
                      </Link>
                    </div>
                    <div className="flex gap-3 md:col-span-7 md:col-start-6">
                      {pics.map((src, j) => (
                        <div key={src} className="relative aspect-[3/4] flex-1 overflow-hidden" style={{ transitionDelay: `${j * 60}ms` }}>
                          <Image src={src} alt="" fill sizes="20vw" className={`object-cover transition-transform duration-[1200ms] ${isOpen ? "scale-100" : "scale-110"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
