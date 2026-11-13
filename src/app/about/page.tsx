import type { Metadata } from "next";
import { pageOg } from "@/lib/site";
import Link from "next/link";
import { Section } from "@/components/Backdrop";
import { BookBand } from "@/components/Closing";
import { ContactSheet } from "@/components/ContactSheet";
import { FilmRow } from "@/components/FilmsBrowser";
import { ScrollWords } from "@/components/ScrollWords";
import { allFilms, identity, projects } from "@/content/projects";
import { disciplines } from "@/content/services";

export const metadata: Metadata = {
  title: "About",
  description: "Kiki Williams is a videographer, photographer and creator working across fashion, beauty and brand photographs and films.",
  alternates: { canonical: "/about" },
  openGraph: pageOg("About", "/about"),
};

export default function About() {
  const onSet = allFilms.filter((f) => f.project.slug === "gaga-agency" || f.project.slug === "future-face-2024");
  const roles = identity.title.split(" / ");
  return (
    <>
      <Section bd="#efeae0" on="ink" label="About" className="px-[var(--gutter)] pb-24 pt-[120px] md:pt-[150px]">
        <p className="kicker flex items-center gap-3">
          <span className="rec-dot" aria-hidden /> About
        </p>
        <h1 className="display mt-6 text-[clamp(96px,19vw,340px)] leading-[0.78]">
          Kiki
          <br />
          <span className="text-signal">Williams</span>
        </h1>
        <div className="mt-14 grid gap-10 md:grid-cols-12">
          <ul className="md:col-span-5">
            {roles.map((r, i) => (
              <li key={r} className="flex items-baseline gap-4 border-t-2 border-current py-3">
                <span className="kicker opacity-50">0{i + 1}</span>
                <span className="display text-[clamp(48px,6vw,96px)] leading-[0.9]">{r}</span>
              </li>
            ))}
          </ul>
          <p className="text-[clamp(22px,2.2vw,32px)] leading-[1.3] md:col-span-6 md:col-start-7">
            {identity.name} is a videographer, photographer and creator. The work on this site runs from studio portraits and product
            stills to fashion films, launch films and backstage coverage, with photographs and films often made on the same day.
          </p>
        </div>
      </Section>

      <Section bd="#0d0c0b" on="paper" label="How the work is made" className="px-[var(--gutter)] py-32">
        <p className="kicker opacity-60">How the work is made</p>
        <ScrollWords
          className="display mt-8 text-[clamp(44px,6.4vw,112px)] leading-[0.95]"
          text="Most of these pictures start with a single seamless colour, one hard light and a few strong pieces. Then the camera rolls, and the same set becomes a film."
        />
      </Section>

      <Section bd="#efeae0" on="ink" label="The palette" className="px-[var(--gutter)] py-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-[clamp(64px,10vw,170px)] leading-[0.84] md:col-span-7">
            The <span className="accent">palette</span>
          </h2>
          <p className="max-w-[36ch] text-[19px] leading-snug md:col-span-5">
            Every project keeps the colour it was made on, and this site wears it as you scroll. Here they are side by side.
          </p>
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-px sm:grid-cols-4 lg:grid-cols-7">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group flex aspect-[3/4] flex-col justify-between p-4 transition-[flex,transform] duration-500 hover:-translate-y-2"
                style={{ background: p.backdrop, color: p.on === "ink" ? "var(--ink)" : "var(--paper)" }}
              >
                <span className="kicker">{p.backdrop.toUpperCase()}</span>
                <span className="display text-[clamp(26px,2.4vw,38px)] leading-[0.9]">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section bd="#7C8687" on="ink" label="On set" className="px-[var(--gutter)] py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="display text-[clamp(64px,10vw,170px)] leading-[0.84]">
            On <span className="accent">set</span>
          </h2>
          <p className="max-w-[40ch] text-[19px] leading-snug">Two films that leave the set, the lights and the crew in frame.</p>
        </div>
        <FilmRow films={onSet} />
      </Section>

      <Section bd="#0d0c0b" on="paper" label="Contact sheet" className="px-[var(--gutter)] py-28">
        <div className="mb-10 grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="display text-[clamp(64px,10vw,170px)] leading-[0.84] md:col-span-7">
            Contact <span className="accent text-signal">sheet</span>
          </h2>
          <div className="md:col-span-5">
            <p className="max-w-[36ch] text-[19px] leading-snug">Every photograph on the site on one sheet. Hover to bring the colour back; select to see it full size.</p>
            <ul className="kicker mt-6 flex flex-wrap gap-2">
              {disciplines.map((d) => (
                <li key={d.slug}>
                  <Link href={`/services#${d.slug}`} className="inline-flex min-h-[36px] items-center rounded-full border border-current px-3 hover:bg-signal hover:text-ink">
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ContactSheet />
      </Section>

      <BookBand />
    </>
  );
}
