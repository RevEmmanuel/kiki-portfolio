"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { allFilms, type FilmWithProject } from "@/content/projects";
import { onColor } from "./Backdrop";
import { Poster, useMedia } from "./Media";

/**
 * Desktop "light table": every film stands in one row of tall frames. The frame in the
 * centre is lit (full size, full colour); its project colour floods the room.
 * Scroll, swipe, arrow buttons or arrow keys move along the row.
 */
export function LightTable() {
  const { openFilm } = useMedia();
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const [focus, setFocus] = useState(0);
  const film = allFilms[focus];

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const n = c as HTMLElement;
      const d = Math.abs(n.offsetLeft + n.offsetWidth / 2 - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setFocus(best);
  }, []);

  const go = (i: number) => {
    const el = track.current;
    const n = el?.children[Math.max(0, Math.min(allFilms.length - 1, i))] as HTMLElement | undefined;
    if (!el || !n) return;
    el.scrollTo({ left: n.offsetLeft + n.offsetWidth / 2 - el.clientWidth / 2, behavior: "smooth" });
  };

  // the room takes the lit film's colour while this section owns the screen
  useEffect(() => {
    const s = section.current;
    if (!s) return;
    const r = s.getBoundingClientRect();
    if (r.top < innerHeight / 2 && r.bottom > innerHeight / 2) {
      document.body.style.setProperty("--page-bd", film.project.backdrop);
      document.body.style.setProperty("--page-on", onColor(film.project.on));
    }
  }, [film]);

  return (
    <section
      ref={section}
      data-bd={film.project.backdrop}
      data-on={film.project.on}
      aria-label="All films"
      className="section-bd relative hidden h-[100svh] min-h-[680px] overflow-hidden md:block"
      style={{ ["--bd" as string]: film.project.backdrop, ["--on" as string]: onColor(film.project.on) }}
    >
      <div
        ref={track}
        onScroll={measure}
        className="no-scrollbar ml-[30vw] flex h-full snap-x snap-mandatory items-center gap-6 overflow-x-auto px-[calc(35vw-19vh)]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(focus + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(focus - 1); }
        }}
      >
        {allFilms.map((f, i) => {
          const lit = i === focus;
          return (
            <button
              key={f.key}
              onClick={() => (lit ? openFilm(allFilms, i) : go(i))}
              onFocus={() => go(i)}
              aria-label={lit ? `Play ${f.title}, ${f.duration}` : `Show ${f.title}`}
              className="group frame relative aspect-[9/16] h-[68vh] shrink-0 snap-center transition-[transform,opacity,filter] duration-500"
              style={{
                transform: lit ? "scale(1)" : "scale(0.8)",
                opacity: lit ? 1 : 0.5,
                filter: lit ? "none" : "grayscale(0.6)",
              }}
            >
              <Poster film={f} sizes="38vh" live={lit} />
              {lit && (
                <span className="ui absolute bottom-0 left-0 bg-[var(--page-bd)] px-3 py-2 text-[17px] text-[var(--page-on)]">
                  Play with sound &nbsp;{f.duration}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* slate for the lit film */}
      <div className="pointer-events-none absolute bottom-[64px] left-[var(--gutter)] w-[calc(30vw-2*var(--gutter))]">
        <p className="ui-sm quiet">{String(focus + 1).padStart(2, "0")} of {String(allFilms.length).padStart(2, "0")}</p>
        <h2 className="display mt-2 text-[clamp(56px,6.4vw,120px)] leading-[0.82]">{film.title}</h2>
        <p className="mt-4 text-[17px] leading-snug">{film.project.summary}</p>
        <Link href={`/work/${film.project.slug}`} className="ui pointer-events-auto mt-4 inline-block py-1 link">
          Open {film.project.title}
        </Link>
      </div>
      <div className="absolute bottom-[64px] right-[var(--gutter)] flex flex-col items-end gap-2">
        <button onClick={() => go(focus - 1)} className="ui text-[18px] link" disabled={focus === 0}>
          Previous
        </button>
        <button onClick={() => go(focus + 1)} className="ui text-[18px] link" disabled={focus === allFilms.length - 1}>
          Next
        </button>
      </div>
    </section>
  );
}

/** Phone: a vertical reel, one full-screen film per swipe, tap to play with sound. */
export function MobileReel() {
  const { openFilm } = useMedia();
  return (
    <section aria-label="All films" className="md:hidden">
      <div className="no-scrollbar h-[calc(100svh-56px)] snap-y snap-mandatory overflow-y-auto bg-ink">
        {allFilms.map((f: FilmWithProject, i) => (
          <article
            key={f.key}
            className="relative h-[calc(100svh-56px)] snap-start snap-always"
            style={{ background: f.project.backdrop }}
          >
            <button onClick={() => openFilm(allFilms, i)} className="absolute inset-0 block" aria-label={`Play ${f.title}, ${f.duration}, with sound`}>
              <Poster film={f} sizes="100vw" live />
            </button>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-5 pt-28 text-paper">
              <p className="ui-sm opacity-80">
                {String(i + 1).padStart(2, "0")} / {allFilms.length} &nbsp; {f.project.categories[0]}
              </p>
              <h2 className="display mt-1 text-[64px] leading-[0.85]">{f.title}</h2>
              <div className="mt-3 flex items-center justify-between">
                <span className="ui text-[18px]">Tap to play with sound</span>
                <span className="ui">{f.duration}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PlayAllButton({ className = "" }: { className?: string }) {
  const { openFilm } = useMedia();
  return (
    <button onClick={() => openFilm(allFilms, 0)} className={`btn ${className}`}>
      Play all {allFilms.length} films in sequence
    </button>
  );
}

export function FilmRow({ films }: { films: FilmWithProject[] }) {
  const { openFilm } = useMedia();
  return (
    <div className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-5 overflow-x-auto px-[var(--gutter)] pb-2">
      {films.map((f) => {
        const i = allFilms.findIndex((a) => a.key === f.key);
        return (
          <div key={f.key} className="w-[44vw] shrink-0 snap-start md:w-[15vw]">
            <button onClick={() => openFilm(allFilms, i)} className="group frame rise block aspect-[9/16] w-full" aria-label={`Play ${f.title}, ${f.duration}`}>
              <Poster film={f} sizes="(min-width: 768px) 15vw, 44vw" />
            </button>
            <p className="ui mt-2 flex justify-between gap-2">
              <span>{f.title}</span>
              <span className="quiet">{f.duration}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
