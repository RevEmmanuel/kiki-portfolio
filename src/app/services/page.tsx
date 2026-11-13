import type { Metadata } from "next";
import { pageOg } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/Backdrop";
import { BookBand } from "@/components/Closing";
import { bySlug } from "@/content/projects";
import { disciplines, type Discipline } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Fashion and editorial photography, fashion films, beauty and portrait, brand and event films, and product photography by Kiki Williams.",
  alternates: { canonical: "/services" },
  openGraph: pageOg("Services", "/services"),
};

const examples = (d: Discipline) =>
  d.work.map((s) => {
    const p = bySlug(s)!;
    const ph = p.photos[0];
    return { slug: p.slug, title: p.title, src: ph?.src ?? p.films[0]?.poster ?? "", alt: ph?.alt ?? "", film: !ph };
  });

function Outputs({ d }: { d: Discipline }) {
  return (
    <ul className="mt-8 border-t border-current/30">
      {d.outputs.map((o) => (
        <li key={o} className="flex items-center gap-4 border-b border-current/30 py-3 text-[19px]">
          <span aria-hidden className="inline-block h-2 w-2 shrink-0 rotate-45 bg-current" />
          {o}
        </li>
      ))}
    </ul>
  );
}

function Enquire({ d }: { d: Discipline }) {
  const onInk = d.on === "paper";
  return (
    <div className="mt-10 flex flex-wrap items-center gap-4">
      <Link href={`/contact?service=${encodeURIComponent(d.enquire)}&about=${encodeURIComponent(d.name)}`} className={`cta ${onInk ? "on-ink" : ""}`}>
        Enquire about {d.line[1]}
      </Link>
      <Link href={`/work/${d.work[0]}`} className="kicker link min-h-[44px] content-center">
        See {bySlug(d.work[0])!.title}
      </Link>
    </div>
  );
}

function Chapter({ d, k }: { d: Discipline; k: number }) {
  const ex = examples(d);
  const variant = k % 3;
  const head = (
    <>
      <p className="kicker flex items-center gap-3">
        <span className="tabular-nums">{d.n} / 05</span> <span aria-hidden className="h-px w-10 bg-current" /> {d.name}
      </p>
      <h2 className="display mt-6 text-[clamp(64px,9vw,160px)] leading-[0.84]">
        {d.line[0]}
        <br />
        <span className="accent">{d.line[1]}</span>
      </h2>
    </>
  );

  return (
    <Section bd={d.bd} on={d.on} label={d.name} id={d.slug} className="relative scroll-mt-20 overflow-hidden px-[var(--gutter)] py-24 md:py-32">
      <span aria-hidden className="display pointer-events-none absolute -right-[0.05em] -top-[0.12em] select-none text-[42vw] leading-none opacity-[0.07] md:text-[30vw]">
        {d.n}
      </span>

      {variant === 0 && (
        <div className="relative grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            {head}
            <p className="mt-8 max-w-[38ch] text-[21px] leading-snug">{d.pitch}</p>
            <Outputs d={d} />
            <Enquire d={d} />
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-5 md:col-start-8 md:gap-4">
            {ex.slice(0, 4).map((e, j) => (
              <Link key={e.slug} href={`/work/${e.slug}`} className={`group relative block overflow-hidden ${j % 2 ? "mt-12" : ""}`} style={{ aspectRatio: "3 / 4" }}>
                <Image src={e.src} alt={e.alt} fill sizes="(min-width: 768px) 22vw, 50vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                <span className="kicker absolute bottom-2 left-2 bg-ink/75 px-2 py-1 text-paper">{e.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {variant === 1 && (
        <div className="relative">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">{head}</div>
            <p className="max-w-[36ch] self-end text-[21px] leading-snug md:col-span-5">{d.pitch}</p>
          </div>
          <div className="no-scrollbar -mx-[var(--gutter)] mt-14 flex snap-x gap-4 overflow-x-auto px-[var(--gutter)]">
            {ex.map((e) => (
              <Link key={e.slug} href={`/work/${e.slug}`} className="group relative block h-[56vh] shrink-0 snap-start overflow-hidden" style={{ aspectRatio: "9 / 16" }}>
                <Image src={e.src} alt={e.alt} fill sizes="32vh" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16 text-paper">
                  <span className="kicker">{e.film ? "Film" : "Photographs"}</span>
                  <span className="display mt-1 block text-[34px] leading-[0.9]">{e.title}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-6">
              <Outputs d={d} />
            </div>
            <div className="md:col-span-5 md:col-start-8 md:self-end">
              <Enquire d={d} />
            </div>
          </div>
        </div>
      )}

      {variant === 2 && (
        <div className="relative grid gap-12 md:grid-cols-12 md:items-center">
          <Link href={`/work/${ex[0].slug}`} className="group relative block aspect-[4/5] overflow-hidden md:col-span-5">
            <Image src={ex[0].src} alt={ex[0].alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
            {ex[1] && (
              <span className="absolute bottom-4 right-4 block aspect-[3/4] w-[38%] overflow-hidden border-4" style={{ borderColor: d.bd }}>
                <Image src={ex[1].src} alt="" fill sizes="15vw" className="object-cover" />
              </span>
            )}
          </Link>
          <div className="md:col-span-6 md:col-start-7">
            {head}
            <p className="mt-8 max-w-[38ch] text-[21px] leading-snug">{d.pitch}</p>
            <Outputs d={d} />
            <Enquire d={d} />
          </div>
        </div>
      )}
    </Section>
  );
}

const steps = [
  ["Message", "WhatsApp or the enquiry form: what you are making, roughly when, and where the pictures will live."],
  ["Plan", "Agree the look before the day: the colour, the light, the set and whether you need stills, film or both."],
  ["Shoot", "Photographs and film can come from the same day, so the campaign and the content match."],
  ["Deliver", "Edited stills and vertical films, cut for the places they are going to be seen."],
];

export default function ServicesPage() {
  return (
    <>
      <Section bd="#0d0c0b" on="paper" label="Services" className="px-[var(--gutter)] pb-20 pt-[120px] md:pt-[150px]">
        <p className="kicker flex items-center gap-3">
          <span className="rec-dot" aria-hidden /> Services
        </p>
        <h1 className="display mt-6 text-[clamp(84px,16vw,300px)] leading-[0.8]">
          Made to be
          <br />
          <span className="accent text-signal">looked at</span>
        </h1>
        <div className="mt-14 grid gap-10 md:grid-cols-12">
          <p className="max-w-[40ch] text-[21px] leading-snug md:col-span-5 md:text-[23px]">
            Five disciplines, each one shown with real work from the archive. Photographs, films, or both from the same day.
          </p>
          <nav aria-label="Disciplines" className="md:col-span-6 md:col-start-7">
            <ul className="border-t border-paper/20">
              {disciplines.map((d) => (
                <li key={d.slug} className="border-b border-paper/20">
                  <a href={`#${d.slug}`} className="group flex min-h-[56px] items-center justify-between gap-4 py-2">
                    <span className="flex items-baseline gap-4">
                      <span className="kicker opacity-50">{d.n}</span>
                      <span className="display text-[clamp(28px,2.6vw,40px)] leading-none transition-colors group-hover:text-signal">{d.name}</span>
                    </span>
                    <span aria-hidden className="inline-block h-4 w-4 shrink-0 rounded-full" style={{ background: d.bd, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.3)" }} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>

      {disciplines.map((d, k) => (
        <Chapter key={d.slug} d={d} k={k} />
      ))}

      <Section bd="#efeae0" on="ink" label="How booking works" className="px-[var(--gutter)] py-28">
        <h2 className="display text-[clamp(64px,10vw,170px)] leading-[0.84]">
          How a booking <span className="accent">works</span>
        </h2>
        <ol className="mt-16 grid gap-px bg-ink/20 md:grid-cols-4">
          {steps.map(([t, body], k) => (
            <li key={t} className="group relative bg-[var(--page-bd,var(--paper))] p-6 pb-10 transition-colors hover:bg-signal md:min-h-[360px]">
              <p className="display text-[96px] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--ink)]">0{k + 1}</p>
              <h3 className="display mt-6 text-[48px] leading-none">{t}</h3>
              <p className="mt-4 max-w-[30ch] text-[18px] leading-snug">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <BookBand line="your next campaign" />
    </>
  );
}
