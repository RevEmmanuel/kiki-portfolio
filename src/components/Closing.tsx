import Link from "next/link";
import { channels, identity, projects } from "@/content/projects";
import { disciplines } from "@/content/services";
import { Section } from "./Backdrop";
import { WorkIndex } from "./WorkIndex";

/** The full list of work as typographic rows with a floating preview. */
export function WorkList({ title = "All work" }: { title?: string }) {
  return (
    <Section bd="#efeae0" on="ink" label="All work" className="px-[var(--gutter)] pb-24 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="display text-[clamp(64px,10vw,170px)]">{title}</h2>
        <p className="kicker pb-3 opacity-70">
          {projects.length} projects · {projects.reduce((n, p) => n + p.photos.length, 0)} photographs ·{" "}
          {projects.reduce((n, p) => n + p.films.length, 0)} films
        </p>
      </div>
      <WorkIndex />
    </Section>
  );
}

/** The booking screen at the end of every page: signal red, one sentence, two ways in. */
export function BookBand({ line = "something worth looking at" }: { line?: string }) {
  const wa = channels[0];
  return (
    <Section bd="#ff3d1f" on="ink" label="Book a shoot" className="solid relative overflow-hidden px-[var(--gutter)] pb-24 pt-28 md:pb-28">
      <p className="kicker flex items-center gap-3">
        <span aria-hidden className="inline-block h-[9px] w-[9px] rounded-full bg-ink" /> Now booking · Photographs and films
      </p>
      <h2 className="display mt-6 text-[clamp(72px,13.5vw,250px)] leading-[0.84]">
        Let&rsquo;s make
        <br />
        <span className="accent text-[0.8em] leading-none">{line}</span>
      </h2>
      <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <p className="max-w-[36ch] text-[20px] leading-snug md:text-[22px]">
          Photographs, films, or both from the same day. Tell {identity.name.split(" ")[0]} what you are making and when.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={wa.href} target="_blank" rel="noopener noreferrer" className="cta !bg-ink !text-paper hover:!bg-paper hover:!text-ink">
            WhatsApp {wa.display}
          </a>
          <Link href="/contact" className="cta-ghost">
            <span>Send an enquiry</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}

/** Footer: the name set across the full width, then the site, the disciplines and every channel. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <Section bd="#0d0c0b" on="paper" label="Footer" className="solid overflow-hidden px-[var(--gutter)] pb-8 pt-20">
      <footer>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="kicker opacity-60">Site</p>
            <ul className="mt-4 space-y-1">
              {[
                ["/", "Home"],
                ["/work", "Work"],
                ["/films", "Films"],
                ["/services", "Services"],
                ["/about", "About"],
                ["/contact", "Contact"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="display inline-block min-h-[40px] text-[34px] leading-[1.1] transition-colors hover:text-signal">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="kicker opacity-60">Disciplines</p>
            <ul className="mt-4 space-y-2">
              {disciplines.map((d) => (
                <li key={d.slug}>
                  <Link href={`/services#${d.slug}`} className="link inline-block py-1 text-[18px]">
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="kicker opacity-60">Contact</p>
            <ul className="mt-4 space-y-3">
              {channels.map((c) => (
                <li key={c.label}>
                  <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group block">
                    <span className="kicker opacity-60">{c.label}</span>
                    <span className="block break-all text-[18px] group-hover:text-signal">{c.display}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p aria-hidden className="display mt-20 whitespace-nowrap text-center text-[17.4vw] leading-[0.78] tracking-[-0.02em]">
          {identity.name}
        </p>
        <div className="kicker mt-6 flex flex-wrap justify-between gap-3 opacity-60">
          <span>
            © {year} {identity.name}
          </span>
          <span>{identity.title}</span>
        </div>
      </footer>
    </Section>
  );
}
