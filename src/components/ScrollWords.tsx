"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

function Word({ w, p, a, b }: { w: string; p: MotionValue<number>; a: number; b: number }) {
  const o = useTransform(p, [a, b], [0.14, 1]);
  return (
    <motion.span style={{ opacity: o }} className="inline-block whitespace-pre">
      {w}{" "}
    </motion.span>
  );
}

/** A paragraph that lights up word by word as it scrolls through the screen. */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  if (reduce) return <p className={className}>{text}</p>;
  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} w={w} p={scrollYProgress} a={i / words.length} b={(i + 1) / words.length} />
        ))}
      </span>
    </p>
  );
}
