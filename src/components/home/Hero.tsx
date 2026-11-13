"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { bySlug, identity } from "@/content/projects";
import { Section } from "../Backdrop";

const frames = (
  [
    ["glitz", 0],
    ["bad-girl", 0],
    ["halle", 1],
    ["jimi", 0],
    ["black-chedder", 0],
    ["extra-pure-skin", 0],
    ["birthday", 0],
    ["halle", 0],
  ] as const
).map(([slug, i]) => {
  const p = bySlug(slug)!;
  const ph = p.photos[i] ?? p.photos[0];
  return { src: ph.src, alt: ph.alt, project: p.title };
});

function Timecode({ run }: { run: boolean }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const id = setInterval(() => setT((performance.now() - start) / 1000), 1000 / 25);
    return () => clearInterval(id);
  }, [run]);
  const f = Math.floor((t % 1) * 25);
  const s = Math.floor(t) % 60;
  const m = Math.floor(t / 60) % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span className="tabular-nums">{`00:${pad(m)}:${pad(s)}:${pad(f)}`}</span>;
}

/**
 * The opening shot. A viewfinder sits between STILL and MOVING, cycling through the archive;
 * scrolling pushes the words apart and opens the frame to the full screen.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % frames.length), 1700);
    return () => clearInterval(id);
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(useTransform(scrollYProgress, [0, 0.75], [0, 1], { clamp: true }), { stiffness: 140, damping: 30, mass: 0.3 });
    const boxW = useMotionTemplate`calc(var(--fw) + ${p} * (100vw - var(--fw)))`;
  const boxH = useMotionTemplate`calc(var(--fh) + ${p} * (100svh - var(--fh)))`;
  const leftX = useTransform(p, [0, 1], ["0vw", "-45vw"]);
  const rightX = useTransform(p, [0, 1], ["0vw", "45vw"]);
  const wordsOpacity = useTransform(p, [0, 0.6], [1, 0]);
  const captionOpacity = useTransform(p, [0.65, 1], [0, 1]);
  const captionY = useTransform(p, [0.65, 1], [40, 0]);
  const shade = useTransform(p, [0.4, 1], [0, 0.45]);

  // load frame-sized images first; ask for full-screen sizes only once the frame has opened up
  const [full, setFull] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    if (v > 0.5 && !full) setFull(true);
  });

  const current = frames[i];

  return (
    <Section bd="#0d0c0b" on="paper" label="Introduction" className="relative">
      <div ref={ref} className={reduce ? "" : "h-[230svh]"}>
        <div
          className="sticky top-0 h-[100svh] overflow-hidden [--fh:calc(var(--fw)*1.5)] [--fw:62vw] md:[--fw:min(26vw,44svh)]"
        >
          {/* the two words */}
          <motion.div aria-hidden style={{ opacity: wordsOpacity }} className="pointer-events-none absolute inset-0 z-0">
            <motion.p
              style={{ x: leftX }}
              className="display absolute left-[var(--gutter)] top-[11svh] z-0 text-[clamp(96px,26vw,180px)] leading-[0.8] md:top-[17svh] md:text-[min(23vw,36svh)]"
            >
              Still
            </motion.p>
            <motion.p
              style={{ x: rightX }}
              className="display absolute bottom-[10svh] right-[var(--gutter)] text-[clamp(96px,26vw,180px)] leading-[0.8] text-signal md:bottom-[9svh] md:text-[min(23vw,36svh)]"
            >
              Moving
            </motion.p>
          </motion.div>
          <motion.p
            aria-hidden
            style={{ x: rightX, opacity: wordsOpacity }}
            className="display pointer-events-none absolute bottom-[10svh] right-[var(--gutter)] z-30 text-[clamp(96px,26vw,180px)] leading-[0.8] text-transparent [-webkit-text-stroke:2px_var(--signal)] md:bottom-[9svh] md:text-[min(23vw,36svh)]"
          >
            Moving
          </motion.p>

          {/* the viewfinder: the picture and its overlay grow together as you scroll */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            style={{ width: reduce ? "var(--fw)" : boxW, height: reduce ? "var(--fh)" : boxH }}
          >
            {frames.map((f, k) => (
              <Image
                key={f.src + k}
                src={f.src}
                alt={k === i ? f.alt : ""}
                fill
                priority={k < 2}
                sizes={full ? "100vw" : "(min-width: 768px) 30vw, 70vw"}
                className="object-cover transition-[opacity,transform] duration-[900ms] ease-[var(--ease)]"
                style={{ opacity: k === i ? 1 : 0, transform: k === i ? "scale(1)" : "scale(1.06)" }}
              />
            ))}
            <motion.div className="absolute inset-0 bg-black" style={{ opacity: shade }} />
          </motion.div>
          <motion.div
            aria-hidden
            className="vf pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-paper [&_.kicker>span]:bg-black/40 [&_.kicker>span]:px-1.5 [&_.kicker>span]:py-0.5"
            style={{ width: reduce ? "var(--fw)" : boxW, height: reduce ? "var(--fh)" : boxH }}
          >
            <div className="kicker absolute inset-x-4 top-4 flex items-center justify-between text-[11px] md:inset-x-5 md:top-5 md:text-[12px]">
              <span className="flex items-center gap-2">
                <span className="rec-dot" /> Rec
              </span>
              <Timecode run={!reduce} />
            </div>
            <div className="kicker absolute inset-x-4 bottom-4 flex items-center justify-between text-[11px] md:inset-x-5 md:bottom-5 md:text-[12px]">
              <span>{current.project}</span>
              <span className="tabular-nums">
                Fr {String(i + 1).padStart(2, "0")}/{String(frames.length).padStart(2, "0")}
              </span>
            </div>
          </motion.div>

          {/* the caption that lands once the frame is full */}
          <motion.div
            style={reduce ? undefined : { opacity: captionOpacity, y: captionY }}
            className="absolute inset-x-[var(--gutter)] bottom-[var(--gutter)] z-30 flex flex-col gap-6 text-paper md:flex-row md:items-end md:justify-between"
          >
            <h1 className="display max-w-[14ch] text-[clamp(44px,7vw,112px)] leading-[0.86]">
              Photographs <span className="accent text-[0.9em]">and</span> films for fashion, beauty <span className="accent text-[0.9em]">and</span> brands
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link href="/work" className="cta on-ink">
                See the work
              </Link>
              <Link href="/contact" className="cta-ghost">
                <span>Book a shoot</span>
              </Link>
            </div>
          </motion.div>

          {/* top meta, before the scroll */}
          <motion.div style={{ opacity: wordsOpacity }} className="kicker absolute inset-x-[var(--gutter)] z-30 top-[84px] hidden justify-between text-paper/70 md:flex md:top-[96px]">
            <span>{identity.title}</span>
            <span>Scroll to open the frame ↓</span>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
