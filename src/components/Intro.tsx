"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { identity, projects } from "@/content/projects";

const ease = [0.76, 0, 0.24, 1] as const;

// one lead frame per project, photographs and film posters, in archive order
const frames = projects
  .map((p) => (p.photos[0] ? { src: p.photos[0].src, bd: p.backdrop } : p.films[0]?.poster ? { src: p.films[0].poster!, bd: p.backdrop } : null))
  .filter((f): f is { src: string; bd: string } => !!f)
  .slice(0, 10);

/**
 * First visit of the session: frames flick past like a contact sheet under a loupe while a
 * counter runs to 100, then the curtain lifts onto the site. Skipped for reduced motion
 * and on every later page view.
 */
export function Intro() {
  // rendered on the server so it covers the first paint; a tiny inline script in <head>
  // adds .kw-seen when it should be skipped, and CSS hides it before anything shows
  const [show, setShow] = useState(true);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (document.documentElement.classList.contains("kw-seen")) {
      setShow(false);
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    const DURATION = 2200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION);
      setN(Math.round((1 - Math.pow(1 - p, 2)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          try {
            sessionStorage.setItem("kw-intro", "1");
          } catch {}
          setShow(false);
          document.documentElement.style.overflow = "";
        }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, []);

  const i = Math.min(frames.length - 1, Math.floor((n / 100) * frames.length));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          aria-hidden
          className="kw-intro fixed inset-0 z-[200] overflow-hidden text-[var(--paper)]"
          style={{ background: frames[i]?.bd ?? "var(--ink)", transition: "background-color 120ms linear" }}
          initial={false}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute left-1/2 top-1/2 aspect-[2/3] w-[min(46vw,300px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
            {frames.map((f, k) => (
              <Image
                key={f.src}
                src={f.src}
                alt=""
                fill
                priority={k < 3}
                sizes="300px"
                className="object-cover"
                style={{ opacity: k === i ? 1 : 0 }}
              />
            ))}
          </div>
          <p className="display absolute left-[var(--gutter)] top-[var(--gutter)] text-[clamp(28px,4vw,56px)]">{identity.name}</p>
          <p className="ui absolute bottom-[var(--gutter)] left-[var(--gutter)] max-w-[20ch] text-[15px] opacity-80">{identity.title}</p>
          <p className="display absolute bottom-[calc(var(--gutter)-0.12em)] right-[var(--gutter)] text-[clamp(96px,22vw,340px)] leading-[0.8] tabular-nums">
            {String(n).padStart(3, "0")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
