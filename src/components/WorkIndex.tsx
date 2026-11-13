"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/content/projects";

const cover = (p: (typeof projects)[number]) => p.photos[0]?.src ?? p.films[0]?.poster ?? null;

/** The full list as big type. On desktop the hovered project's picture floats with the pointer. */
export function WorkIndex({ list = projects }: { list?: typeof projects } = {}) {
  const [hover, setHover] = useState<number | null>(null);
  const float = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, cx: 0, cy: 0, vx: 0 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const loop = () => {
      const p = pos.current;
      const nx = p.cx + (p.x - p.cx) * 0.14;
      p.vx = nx - p.cx;
      p.cx = nx;
      p.cy += (p.y - p.cy) * 0.14;
      if (float.current) float.current.style.transform = `translate3d(${p.cx}px, ${p.cy}px, 0) translate(-50%, -50%) rotate(${Math.max(-12, Math.min(12, p.vx * 0.6))}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      onPointerMove={(e) => {
        pos.current.x = e.clientX;
        pos.current.y = e.clientY;
      }}
      onPointerLeave={() => setHover(null)}
    >
      <ul className="mt-10">
        {list.map((p, i) => (
          <li key={p.slug} className="border-t border-current/20 last:border-b">
            <Link
              href={`/work/${p.slug}`}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(null)}
              className="group grid grid-cols-[28px_1fr_auto] items-center gap-x-4 py-3 transition-opacity duration-300 md:grid-cols-[48px_1fr_260px_200px]"
              style={{ opacity: hover === null || hover === i ? 1 : 0.28 }}
            >
              <span className="ui-sm tabular-nums opacity-60">{String(projects.indexOf(p) + 1).padStart(2, "0")}</span>
              <span className="display text-[clamp(34px,5.4vw,88px)] leading-[0.9] transition-transform duration-500 ease-[var(--ease)] group-hover:translate-x-4">
                {p.title}
              </span>
              <span className="ui hidden md:block">{p.categories[0]}</span>
              <span className="ui-sm quiet flex items-center justify-end gap-2 text-right">
                <span aria-hidden className="inline-block h-3 w-3 rounded-full" style={{ background: p.backdrop, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.2)" }} />
                {p.medium === "both" ? "Photo + film" : p.medium === "photo" ? "Photographs" : "Film"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div
        ref={float}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden aspect-[2/3] w-[clamp(180px,17vw,280px)] overflow-hidden md:block"
        style={{ opacity: hover === null ? 0 : 1, transition: "opacity 250ms var(--ease)" }}
      >
        {list.map((p, i) => {
          const src = cover(p);
          return src ? (
            <Image
              key={p.slug}
              src={src}
              alt=""
              fill
              sizes="280px"
              className="object-cover transition-[opacity,transform] duration-500"
              style={{ opacity: hover === i ? 1 : 0, transform: hover === i ? "scale(1)" : "scale(1.15)" }}
            />
          ) : null;
        })}
      </div>
    </div>
  );
}
