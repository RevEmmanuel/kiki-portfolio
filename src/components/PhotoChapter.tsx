"use client";

import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/projects";
import { Section } from "./Backdrop";
import { useMedia } from "./Media";
import { fitW } from "./fit";

/**
 * One shoot as a chapter in its own colour. Three compositions rotate so the page
 * reads like a publication rather than a grid: lead-left, lead-right, and a contact strip.
 */
export function PhotoChapter({ p, variant }: { p: Project; variant: 0 | 1 | 2 }) {
  const { openPhoto } = useMedia();
  const list = p.photos.map((ph) => ({ ...ph, project: p.title }));
  const open = (i: number) => openPhoto(list, i);
  const [lead, ...rest] = p.photos;

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <h2 className="display whitespace-nowrap" style={{ fontSize: fitW(p.title, 16, 160) }}>{p.title}</h2>
      <div className="pb-[1vw] md:text-right">
        <p className="ui">{p.categories.join(", ")}</p>
        <p className="ui-sm quiet mt-1">
          {p.photos.length} photograph{p.photos.length > 1 ? "s" : ""}
          {p.films.length > 0 && `, ${p.films.length} film${p.films.length > 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );

  const caption = (
    <div className="max-w-[34ch]">
      <p className="text-[19px] leading-snug">{p.summary}</p>
      <Link href={`/work/${p.slug}`} className="ui mt-4 inline-block text-[17px] link">
        Open {p.title}
      </Link>
    </div>
  );

  if (variant === 2 || p.photos.length === 1) {
    return (
      <Section bd={p.backdrop} on={p.on} label={p.title} id={p.slug} className="overflow-hidden px-[var(--gutter)] pb-28 pt-24 md:pb-20">
        {header}
        <div className="no-scrollbar -mx-[var(--gutter)] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] md:gap-6">
          {p.photos.map((ph, i) => (
            <button
              key={ph.src}
              onClick={() => open(i)}
              className="group frame rise relative h-[62vh] shrink-0 snap-start md:h-[72vh]"
              style={{ aspectRatio: `${ph.w} / ${ph.h}` }}
              aria-label={`View ${p.title}, photograph ${i + 1} of ${p.photos.length}`}
            >
              <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 768px) 50vh, 45vh" className="transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
            </button>
          ))}
          <div className="flex w-[min(78vw,360px)] shrink-0 snap-start items-end pb-2">{caption}</div>
        </div>
      </Section>
    );
  }

  const flip = variant === 1;
  return (
    <Section bd={p.backdrop} on={p.on} label={p.title} id={p.slug} className="overflow-hidden px-[var(--gutter)] pb-28 pt-24 md:pb-20">
      {header}
      <div className="mt-8 grid grid-cols-12 gap-x-[var(--gutter)] gap-y-6 md:mt-10">
        <button
          onClick={() => open(0)}
          className={`group frame rise col-span-12 md:col-span-6 ${flip ? "md:col-start-7" : ""}`}
          style={{ aspectRatio: `${lead.w} / ${lead.h}` }}
          aria-label={`View ${p.title}, photograph 1 of ${p.photos.length}`}
        >
          <Image src={lead.src} alt={lead.alt} fill sizes="(min-width: 768px) 48vw, 100vw" className="transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
        </button>

        <div className={`col-span-12 grid grid-cols-6 content-start gap-x-[var(--gutter)] gap-y-8 md:col-span-6 md:row-start-1 ${flip ? "md:col-start-1" : "md:col-start-7"}`}>
          {rest.map((ph, k) => (
            <button
              key={ph.src}
              onClick={() => open(k + 1)}
              className={`group frame rise ${k % 2 === 0 ? "col-span-4 md:col-span-3" : "col-span-3 col-start-4 md:col-span-2 md:col-start-5 md:mt-[22vh]"} ${k === 2 ? "col-start-1 md:col-start-2" : ""}`}
              style={{ aspectRatio: `${ph.w} / ${ph.h}` }}
              aria-label={`View ${p.title}, photograph ${k + 2} of ${p.photos.length}`}
            >
              <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 768px) 24vw, 60vw" className="transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
            </button>
          ))}
          <div className="col-span-6 md:col-span-4 md:mt-6">{caption}</div>
        </div>
      </div>
    </Section>
  );
}
