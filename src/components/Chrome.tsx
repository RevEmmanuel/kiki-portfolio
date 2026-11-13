"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { channels, identity, projects } from "@/content/projects";

const ease = [0.76, 0, 0.24, 1] as const;

export const nav = [
  { href: "/work", label: "Work", img: projects.find((p) => p.slug === "glitz")!.photos[0].src },
  { href: "/films", label: "Films", img: projects.find((p) => p.slug === "saskay")!.films[0].poster! },
  { href: "/services", label: "Services", img: projects.find((p) => p.slug === "extra-pure-skin")!.photos[0].src },
  { href: "/about", label: "About", img: projects.find((p) => p.slug === "halle")!.photos[0].src },
  { href: "/contact", label: "Contact", img: projects.find((p) => p.slug === "bad-girl")!.photos[0].src },
];

/**
 * Header: wordmark, four links and a signal-red booking pill. It tucks away while you scroll
 * down and comes back as soon as you scroll up. On phones the links live in a full-screen menu.
 */
export function Chrome() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 300 && y > last.current + 4 ? true : y < last.current - 4 ? false : hidden);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hidden]);

  const is = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <a href="#main" className="kicker fixed left-4 top-4 z-[130] -translate-y-24 bg-ink px-3 py-3 text-paper focus:translate-y-0">
        Skip to content
      </a>

      <header
        className="fixed inset-x-0 top-0 z-[90] transition-transform duration-500 ease-[var(--ease)]"
        style={{ transform: hidden && !open ? "translateY(-110%)" : "none" }}
      >
        <div
          className="flex h-[64px] items-center justify-between gap-6 px-[var(--gutter)] transition-colors duration-500 md:h-[76px]"
          style={{ background: scrolled ? "color-mix(in srgb, var(--page-bd, var(--paper)) 88%, transparent)" : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none" }}
        >
          <Link href="/" aria-label={`${identity.name}, home`} className="group flex items-center gap-3">
            <span className="rec-dot" aria-hidden />
            <span className="display text-[26px] leading-none md:text-[30px]">{identity.name}</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {nav.slice(0, 4).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={is(l.href) ? "page" : undefined}
                className="kicker relative py-2 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="cta hidden !min-h-[44px] !px-5 !text-[15px] md:inline-flex">
              Book a shoot
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="kicker flex min-h-[44px] items-center gap-3 lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              Menu
              <span aria-hidden className="flex flex-col gap-[5px]">
                <span className="block h-[2px] w-6 bg-current" />
                <span className="block h-[2px] w-4 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <Menu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}

function Menu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("a,button")?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[120] flex flex-col overflow-y-auto bg-ink text-paper"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduce ? 0.2 : 0.7, ease }}
        >
          <div className="flex h-[64px] shrink-0 items-center justify-between px-[var(--gutter)] md:h-[76px]">
            <Link href="/" className="flex items-center gap-3">
              <span className="rec-dot" aria-hidden />
              <span className="display text-[26px] leading-none md:text-[30px]">{identity.name}</span>
            </Link>
            <button onClick={onClose} className="kicker min-h-[44px] px-1">
              Close
            </button>
          </div>

          <div className="grid flex-1 gap-10 px-[var(--gutter)] pb-10 pt-6 md:grid-cols-12">
            <nav aria-label="Menu" className="md:col-span-7">
              <ul>
                {nav.map((l, i) => (
                  <li key={l.href} className="overflow-hidden border-b border-paper/15">
                    <motion.div
                      initial={reduce ? false : { y: "105%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease, delay: 0.25 + i * 0.06 }}
                    >
                      <Link
                        href={l.href}
                        onPointerEnter={() => setHover(i)}
                        onFocus={() => setHover(i)}
                        aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                        className="group flex items-baseline gap-5 py-2"
                      >
                        <span className="kicker w-8 text-paper/50">0{i + 1}</span>
                        <span className="display text-[clamp(56px,11vw,140px)] leading-[0.92] transition-[color,transform] duration-300 group-hover:translate-x-3 group-hover:text-signal group-aria-[current=page]:text-signal">
                          {l.label}
                        </span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col justify-between gap-10 md:col-span-4 md:col-start-9">
              <div className="relative hidden aspect-[4/5] overflow-hidden md:block">
                {nav.map((l, i) => (
                  <Image
                    key={l.href}
                    src={l.img}
                    alt=""
                    fill
                    sizes="30vw"
                    className="object-cover transition-[opacity,transform] duration-700"
                    style={{ opacity: hover === i ? 1 : 0, transform: hover === i ? "scale(1)" : "scale(1.08)" }}
                  />
                ))}
              </div>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="block min-h-[44px]">
                      <span className="kicker text-paper/50">{c.label}</span>
                      <span className="mt-1 block break-all text-[17px] leading-snug">{c.display}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
