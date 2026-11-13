"use client";

import { usePathname } from "next/navigation";
import { useEffect, type CSSProperties, type ReactNode } from "react";

const INK = "#0d0c0b";
const PAPER = "#efeae0";

export const onColor = (on: "ink" | "paper") => (on === "ink" ? INK : PAPER);

/**
 * A section that owns a backdrop colour. Without JS it paints its own background;
 * with JS the body takes over so colours crossfade as you scroll.
 */
export function Section({
  bd,
  on,
  children,
  className = "",
  id,
  label,
  style,
}: {
  bd: string;
  on: "ink" | "paper";
  children: ReactNode;
  className?: string;
  id?: string;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      data-bd={bd}
      data-on={on}
      className={`section-bd ${className}`}
      style={{ ...style, ["--bd" as string]: bd, ["--on" as string]: onColor(on) }}
    >
      {children}
    </section>
  );
}

/** Watches which backdrop section crosses the middle of the viewport and washes the page to it. */
export function BackdropObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js-wash");
    const apply = (el: Element) => {
      const bd = el.getAttribute("data-bd");
      const on = el.getAttribute("data-on") as "ink" | "paper" | null;
      if (!bd || !on) return;
      document.body.style.setProperty("--page-bd", bd);
      document.body.style.setProperty("--page-on", onColor(on));
      root.dataset.on = on;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", bd);
    };

    const sections = Array.from(document.querySelectorAll("[data-bd]"));
    if (sections[0]) apply(sections[0]);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) apply(e.target);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));

    // Frame entrances (once each)
    const rise = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add("in");
            rise.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".rise").forEach((el) => rise.observe(el));

    return () => {
      io.disconnect();
      rise.disconnect();
    };
  }, [pathname]);

  return null;
}
