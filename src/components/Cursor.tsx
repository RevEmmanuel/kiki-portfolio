"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A soft disc that trails the pointer and opens into a label over pictures and films:
 * "View" on photographs, "Play" on films, "Open" on project links. Fine pointers only;
 * the system cursor stays visible, so nothing is lost when this is off.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    let x = -100, y = -100, cx = x, cy = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as Element | null)?.closest?.("[data-cursor], button[aria-label^='View'], button[aria-label^='Play'], a[href^='/work/']");
      if (!t) return setLabel("");
      const explicit = t.getAttribute("data-cursor");
      const aria = t.getAttribute("aria-label") ?? "";
      setLabel(explicit ?? (aria.startsWith("Play") ? "Play" : aria.startsWith("View") ? "View" : "Open"));
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const leave = () => setLabel("");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!on) return null;
  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[150] flex items-center justify-center rounded-full mix-blend-difference"
      style={{
        width: label ? 92 : 12,
        height: label ? 92 : 12,
        background: "#f3efe7",
        transition: "width 350ms var(--ease), height 350ms var(--ease)",
      }}
    >
      <span className="ui text-[15px] text-black" style={{ opacity: label ? 1 : 0, transition: "opacity 200ms" }}>
        {label}
      </span>
    </div>
  );
}
