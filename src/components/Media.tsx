"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { FilmWithProject, Photo } from "@/content/projects";
import { StreamPlayer } from "./StreamPlayer";

type LightboxItem = Photo & { project: string };

type Ctx = {
  openFilm: (list: FilmWithProject[], index: number) => void;
  openPhoto: (list: LightboxItem[], index: number) => void;
};

const MediaCtx = createContext<Ctx | null>(null);
export const useMedia = () => {
  const c = useContext(MediaCtx);
  if (!c) throw new Error("useMedia outside MediaProvider");
  return c;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Keeps keyboard focus inside an open overlay and returns it when the overlay closes. */
function useDialog(open: boolean, onClose: () => void, extraKeys?: (e: KeyboardEvent) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      extraKeys?.(e);
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("button, a, iframe, [tabindex]");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      restore.current?.focus();
    };
  }, [open, onClose, extraKeys]);
  return ref;
}

export function MediaProvider({ children }: { children: ReactNode }) {
  const [films, setFilms] = useState<{ list: FilmWithProject[]; i: number } | null>(null);
  const [photos, setPhotos] = useState<{ list: LightboxItem[]; i: number } | null>(null);

  const openFilm = useCallback((list: FilmWithProject[], i: number) => setFilms({ list, i }), []);
  const openPhoto = useCallback((list: LightboxItem[], i: number) => setPhotos({ list, i }), []);

  return (
    <MediaCtx.Provider value={{ openFilm, openPhoto }}>
      {children}
      <Theatre state={films} setState={setFilms} />
      <Lightbox state={photos} setState={setPhotos} />
    </MediaCtx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Film theatre: the one dark room on the site                         */
/* ------------------------------------------------------------------ */

function Theatre({
  state,
  setState,
}: {
  state: { list: FilmWithProject[]; i: number } | null;
  setState: (s: { list: FilmWithProject[]; i: number } | null) => void;
}) {
  const reduce = useReducedMotion();
  const close = useCallback(() => setState(null), [setState]);
  const step = useCallback(
    (d: number) => {
      if (!state) return;
      setState({ ...state, i: (state.i + d + state.list.length) % state.list.length });
    },
    [state, setState],
  );
  const keys = useCallback(
    (e: KeyboardEvent) => {
      // inside the player, arrows seek; elsewhere they move between films
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key.toLowerCase() === "n") step(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key.toLowerCase() === "p") step(-1);
    },
    [step],
  );
  const ref = useDialog(!!state, close, keys);
  const film = state?.list[state.i];

  return (
    <AnimatePresence>
      {state && film && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={`Film: ${film.title}`}
          className="fixed inset-0 z-[80] bg-theatre text-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.45, ease }}
        >
          {/* a faint wash of the project's colour, like light spilling from the screen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(60% 70% at 50% 55%, ${film.project.backdrop}66, transparent 70%)`,
            }}
          />
          <div className="relative grid h-full grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
            {/* left: slate */}
            <div className="hidden flex-col justify-between p-[var(--gutter)] md:flex">
              <button data-autofocus onClick={close} className="ui self-start link">
                Close
              </button>
              <div>
                <p className="ui-sm quiet">{film.project.categories.join(", ")}</p>
                <h2 className="display mt-3 text-[clamp(56px,7vw,120px)]">{film.title}</h2>
                <p className="mt-6 max-w-[34ch] text-[17px] leading-relaxed opacity-80">
                  {film.project.summary}
                </p>
                <Link
                  href={`/work/${film.project.slug}`}
                  onClick={close}
                  className="ui mt-6 inline-block link"
                >
                  Open the project
                </Link>
              </div>
              <Timecode film={film} index={state.i} total={state.list.length} />
            </div>

            {/* centre: the frame */}
            <div className="relative flex items-center justify-center p-0 md:py-[4vh]">
              <motion.div
                key={film.key}
                className="relative aspect-[9/16] h-[100svh] max-w-full overflow-hidden bg-black md:h-[92vh]"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduce ? 0 : 0.6, ease }}
              >
                <StreamPlayer film={film} />
              </motion.div>
            </div>

            {/* right: navigation */}
            <div className="hidden flex-col items-end justify-between p-[var(--gutter)] md:flex">
              <p className="ui-sm quiet max-w-[26ch] text-right">
                Space plays or pauses. M sound. F fullscreen. With the film selected, arrow keys skip 5 seconds.
              </p>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => step(-1)} className="ui link">
                  Previous film
                </button>
                <button onClick={() => step(1)} className="ui link">
                  Next film
                </button>
                <p className="ui-sm quiet mt-2">N and P move between films. Esc closes.</p>
              </div>
            </div>

            {/* mobile chrome */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:hidden">
              <div className="pointer-events-auto rounded-none bg-black/50 px-3 py-2">
                <p className="ui">{film.title}</p>
                <p className="ui-sm quiet">{film.duration}</p>
              </div>
              <div className="pointer-events-auto flex gap-1">
                <button onClick={() => step(-1)} className="ui min-h-[44px] bg-black/50 px-3" aria-label="Previous film">
                  Prev
                </button>
                <button onClick={() => step(1)} className="ui min-h-[44px] bg-black/50 px-3" aria-label="Next film">
                  Next
                </button>
                <button data-autofocus onClick={close} className="ui min-h-[44px] bg-black/50 px-3">
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Timecode({ film, index, total }: { film: FilmWithProject; index: number; total: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  // a slate-style ruler: one tick per second of running time
  const [m, s] = film.duration.split(":").map(Number);
  const secs = m * 60 + s;
  return (
    <div>
      <div aria-hidden className="flex h-5 items-end gap-[3px]">
        {Array.from({ length: Math.min(secs, 90) }).map((_, i) => (
          <span key={i} className="block w-px bg-current" style={{ height: i % 5 === 0 ? 20 : 8, opacity: i % 5 === 0 ? 0.9 : 0.4 }} />
        ))}
      </div>
      <p className="ui mt-3">
        Film {pad(index + 1)} of {pad(total)} &nbsp; {film.duration} running time
      </p>
    </div>
  );
}

// only one preview loop plays at a time
let activeLoop: HTMLVideoElement | null = null;

/**
 * A film's poster frame. When the film has a silent preview loop, the loop plays while the
 * frame is at least half on screen, one at a time, and never for reduced-motion or data-saver users.
 */
export function Poster({
  film,
  sizes,
  priority,
  live = false,
}: {
  film: { poster: string | null; title: string; loop?: string };
  sizes: string;
  priority?: boolean;
  /** play the preview loop when visible */
  live?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "");
    setAllowed(live && !!film.loop && !reduce && !slow);
  }, [live, film.loop, reduce]);

  useEffect(() => {
    const v = ref.current;
    if (!allowed || !v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (activeLoop && activeLoop !== v) activeLoop.pause();
          activeLoop = v;
          v.play().catch(() => undefined);
        } else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    const onVis = () => document.hidden && v.pause();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      v.pause();
      if (activeLoop === v) activeLoop = null;
    };
  }, [allowed]);

  if (!film.poster)
    return (
      <span className="absolute inset-0 flex flex-col justify-end bg-[#1e1c1a] p-5 text-paper">
        <span className="display text-[clamp(28px,3vw,48px)] leading-[0.9]">{film.title}</span>
      </span>
    );
  return (
    <>
      <Image
        src={film.poster}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035]"
      />
      {allowed && film.loop && (
        <video
          ref={ref}
          src={film.loop}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Lightbox: full-size stills                                          */
/* ------------------------------------------------------------------ */

function Lightbox({
  state,
  setState,
}: {
  state: { list: LightboxItem[]; i: number } | null;
  setState: (s: { list: LightboxItem[]; i: number } | null) => void;
}) {
  const reduce = useReducedMotion();
  const close = useCallback(() => setState(null), [setState]);
  const step = useCallback(
    (d: number) => state && setState({ ...state, i: (state.i + d + state.list.length) % state.list.length }),
    [state, setState],
  );
  const keys = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    },
    [step],
  );
  const ref = useDialog(!!state, close, keys);
  const startX = useRef<number | null>(null);
  const item = state?.list[state.i];

  return (
    <AnimatePresence>
      {state && item && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph from ${item.project}`}
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: "var(--page-bd, #0d0c0b)", color: "var(--page-on, #efeae0)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease }}
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            startX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-[var(--gutter)] py-4">
            <p className="ui">
              {item.project} <span className="quiet">&nbsp; {state.i + 1} / {state.list.length}</span>
            </p>
            <button data-autofocus onClick={close} className="ui link">
              Close
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <motion.div
              key={item.src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.4 }}
            >
              <Image src={item.src} alt={item.alt} fill sizes="100vw" className="object-contain" priority />
            </motion.div>
            <button
              onClick={() => step(-1)}
              className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
              aria-label="Previous photograph"
            />
            <button
              onClick={() => step(1)}
              className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize"
              aria-label="Next photograph"
            />
          </div>
          <div className="flex items-start justify-between gap-6 px-[var(--gutter)] py-4">
            <p className="max-w-[60ch] text-[15px] italic opacity-80">{item.alt}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
