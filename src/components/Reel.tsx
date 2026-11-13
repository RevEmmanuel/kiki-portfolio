"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { allFilms, projects } from "@/content/projects";
import { Section } from "./Backdrop";
import { useMedia } from "./Media";

type Item =
  | { kind: "photo"; src: string; alt: string; w: number; h: number; project: string; slug: string; list: number; index: number }
  | { kind: "film"; src: string; title: string; project: string; film: number };

const photoLists = projects.filter((p) => p.photos.length).map((p) => p.photos.map((ph) => ({ ...ph, project: p.title })));
const items: Item[] = [];
{
  // interleave: two photographs, then a film poster, through the whole archive
  const photos = projects.flatMap((p, pi) =>
    p.photos.map((ph, i) => ({ kind: "photo" as const, src: ph.src, alt: ph.alt, w: ph.w, h: ph.h, project: p.title, slug: p.slug, list: projects.filter((q) => q.photos.length).indexOf(p), index: i, pi })),
  );
  const films = allFilms.map((f, i) => (f.poster ? { kind: "film" as const, src: f.poster, title: f.title, project: f.project.title, film: i } : null)).filter(Boolean) as Item[];
  let fi = 0;
  photos.forEach((ph, k) => {
    items.push(ph);
    if (k % 2 === 1 && films[fi]) items.push(films[fi++]);
  });
  while (films[fi]) items.push(films[fi++]);
}
const heights = ["58vh", "44vh", "66vh", "50vh", "40vh", "62vh"];
const offsets = ["0vh", "14vh", "-6vh", "8vh", "-12vh", "4vh"];

/**
 * The whole archive on one strip. On wide screens the section pins and vertical scrolling
 * drives the strip sideways, with the name sliding the other way behind it.
 * On phones (and with reduced motion) it is a plain swipeable row.
 */
export function Reel({ limit }: { limit?: number } = {}) {
  const list = limit ? items.slice(0, limit) : items;
  const { openPhoto, openFilm } = useMedia();
  const reduce = useReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const measure = () => {
      setWide(mq.matches && !reduce);
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -dist]);
  const bgX = useTransform(smooth, [0, 1], ["10%", "-45%"]);
  const progress = useTransform(smooth, [0, 1], ["0%", "100%"]);

  const strip = (
    <div ref={track} className={`flex items-center gap-[3vw] px-[var(--gutter)] ${wide ? "w-max" : "no-scrollbar snap-x snap-mandatory overflow-x-auto py-6"}`}>
      <div className="w-[min(70vw,420px)] shrink-0 snap-start self-end pb-[6vh]">
        <p className="ui-sm opacity-70">The archive</p>
        <h2 className="display mt-2 text-[clamp(56px,7vw,120px)] leading-[0.86]">
          Every
          <br />
          frame
        </h2>
        <p className="mt-4 max-w-[28ch] text-[18px] leading-snug opacity-85">
          {limit ? "A cut from the archive, stills and films side by side. Keep scrolling." : `${items.filter((i) => i.kind === "photo").length} photographs and ${items.filter((i) => i.kind === "film").length} films. Keep scrolling.`}
        </p>
      </div>
      {list.map((it, k) => {
        const h = wide ? heights[k % heights.length] : "52vh";
        const style = { height: h, aspectRatio: it.kind === "photo" ? `${it.w} / ${it.h}` : "9 / 16", marginTop: wide ? offsets[k % offsets.length] : 0 };
        return (
          <button
            key={`${it.kind}-${it.src}-${k}`}
            onClick={() => (it.kind === "photo" ? openPhoto(photoLists[it.list], it.index) : openFilm(allFilms, it.film))}
            aria-label={it.kind === "photo" ? `View ${it.project}, photograph` : `Play ${it.title}`}
            className="group relative shrink-0 snap-start overflow-hidden text-left"
            style={style}
          >
            <Image src={it.src} alt={it.kind === "photo" ? it.alt : ""} fill sizes="40vh" className="object-cover transition-transform duration-[1400ms] ease-[var(--ease)] group-hover:scale-[1.06]" />
            <span className="ui absolute bottom-0 left-0 translate-y-full bg-[var(--paper)] px-2 py-1 text-[13px] text-[var(--ink)] transition-transform duration-300 group-hover:translate-y-0">
              {it.project}
              {it.kind === "film" && " · Film"}
            </span>
          </button>
        );
      })}
      {limit && (
        <a href="/work" className="flex aspect-[9/16] h-[44vh] shrink-0 snap-start flex-col justify-end border border-current/30 p-6 transition-colors hover:bg-signal hover:text-ink">
          <span className="kicker">The full archive</span>
          <span className="display mt-2 text-[56px] leading-[0.9]">All work →</span>
        </a>
      )}
      <div className="w-[10vw] shrink-0" />
    </div>
  );

  return (
    <Section bd="#0d0c0b" on="paper" label="The archive" className="relative">
      {wide ? (
        <div ref={outer} style={{ height: `calc(100vh + ${dist}px)` }}>
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <motion.p
              aria-hidden
              style={{ x: bgX, WebkitTextStroke: "1.5px color-mix(in srgb, var(--paper) 45%, transparent)" }}
              className="display pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[34vh] leading-none text-transparent"
            >
              Still / Moving / Still / Moving
            </motion.p>
            <motion.div style={{ x }} className="relative">
              {strip}
            </motion.div>
            <div className="absolute bottom-6 left-[var(--gutter)] right-[var(--gutter)] h-px bg-current/20">
              <motion.div className="h-px bg-current" style={{ width: progress }} />
            </div>
          </div>
        </div>
      ) : (
        <div ref={outer} className="py-20">
          {strip}
        </div>
      )}
    </Section>
  );
}
