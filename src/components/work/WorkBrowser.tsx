"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { projects, type Project } from "@/content/projects";
import { WorkIndex } from "../WorkIndex";

const filters = [
  { key: "all", label: "All", test: () => true },
  { key: "photography", label: "Photography", test: (p: Project) => p.photos.length > 0 },
  { key: "film", label: "Film", test: (p: Project) => p.films.length > 0 },
  { key: "fashion", label: "Fashion", test: (p: Project) => p.categories.some((c) => c.startsWith("Fashion")) },
  { key: "beauty", label: "Beauty & portrait", test: (p: Project) => p.categories.includes("Beauty & portrait") },
  { key: "brand", label: "Brand & events", test: (p: Project) => p.categories.includes("Brand & events") || p.categories.includes("Commercial") },
  { key: "personal", label: "Personal", test: (p: Project) => p.categories.includes("Personal") },
] as const;

type Key = (typeof filters)[number]["key"];

function Card({ p, n }: { p: Project; n: number }) {
  const ph = p.photos[0];
  const film = p.films[0];
  const src = ph?.src ?? film?.poster;
  const ratio = ph ? `${ph.w} / ${ph.h}` : "9 / 16";
  const label = p.medium === "both" ? "Photo + film" : p.medium === "photo" ? `${p.photos.length} photo${p.photos.length > 1 ? "s" : ""}` : `${p.films.length} film${p.films.length > 1 ? "s" : ""}`;
  return (
    <Link href={`/work/${p.slug}`} className="group block" aria-label={`Open ${p.title}, ${p.categories[0]}, ${label}`}>
      <div className="relative overflow-hidden" style={{ aspectRatio: ratio, background: p.backdrop }}>
        {src && (
          <Image
            src={src}
            alt={ph?.alt ?? ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-[transform,opacity] duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.04] group-hover:opacity-80"
          />
        )}
        {/* the project's colour floods up from the bottom with its name */}
        <div
          className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col justify-end p-5 transition-transform duration-500 ease-[var(--ease)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
          style={{ background: p.backdrop, color: p.on === "ink" ? "var(--ink)" : "var(--paper)" }}
        >
          <span className="kicker">{p.categories.join(" · ")}</span>
          <span className="mt-2 line-clamp-2 text-[16px] leading-snug">{p.summary}</span>
        </div>
        <span className="kicker absolute left-3 top-3 bg-ink/70 px-2 py-1 text-paper">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h2 className="display text-[clamp(34px,3.4vw,54px)] leading-[0.9] transition-colors group-hover:text-signal">{p.title}</h2>
        <span className="kicker opacity-60">{String(n).padStart(2, "0")}</span>
      </div>
    </Link>
  );
}

export function WorkBrowser() {
  const reduce = useReducedMotion();
  const [f, setF] = useState<Key>("all");
  const [view, setView] = useState<"grid" | "index">("grid");

  // ?f=film etc. so old links (/photographs) and the services page can land pre-filtered
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("f");
    if (q && filters.some((x) => x.key === q)) setF(q as Key);
  }, []);
  const choose = (k: Key) => {
    setF(k);
    const url = new URL(window.location.href);
    if (k === "all") url.searchParams.delete("f");
    else url.searchParams.set("f", k);
    window.history.replaceState(null, "", url);
  };

  const test = filters.find((x) => x.key === f)!.test;
  const list = projects.filter(test);

  return (
    <div>
      <div className="sticky top-[64px] z-30 -mx-[var(--gutter)] flex flex-wrap items-center justify-between gap-4 bg-[color-mix(in_srgb,var(--page-bd,var(--paper))_92%,transparent)] px-[var(--gutter)] py-4 backdrop-blur md:top-[76px]">
        <div role="group" aria-label="Filter work" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {filters.map((x) => {
            const count = projects.filter(x.test).length;
            if (!count) return null;
            return (
              <button
                key={x.key}
                onClick={() => choose(x.key)}
                aria-pressed={f === x.key}
                className="kicker shrink-0 rounded-full border border-current px-4 py-2.5 transition-colors aria-pressed:border-signal aria-pressed:bg-signal aria-pressed:text-ink"
              >
                {x.label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <div role="group" aria-label="View" className="flex gap-1">
          {(["grid", "index"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className="kicker min-h-[40px] px-3 opacity-50 aria-pressed:underline aria-pressed:underline-offset-4 aria-pressed:opacity-100">
              {v === "grid" ? "Grid" : "Index"}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {list.length} projects shown
      </p>

      {view === "grid" ? (
        <motion.ul layout={!reduce} className="mt-10 grid grid-cols-1 gap-x-[var(--gutter)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p, k) => (
              <motion.li
                key={p.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : (k % 3) * 0.05 }}
                className={k % 3 === 1 ? "lg:mt-24" : k % 3 === 2 ? "lg:mt-10" : ""}
              >
                <Card p={p} n={projects.indexOf(p) + 1} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <WorkIndex list={list} />
      )}
    </div>
  );
}
