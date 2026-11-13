"use client";

import Image from "next/image";
import Link from "next/link";
import { allFilms, identity, type Project } from "@/content/projects";
import { Section } from "./Backdrop";
import { fitW } from "./fit";
import { Poster, useMedia } from "./Media";

/** Project hero: the title as the backdrop, the lead frame standing in front, metadata beside it. */
export function ProjectHero({ p }: { p: Project }) {
  const { openFilm, openPhoto } = useMedia();
  const photos = p.photos.map((ph) => ({ ...ph, project: p.title }));
  const leadFilm = p.medium === "film" ? p.films[0] : null;
  const leadPhoto = p.photos[0];

  const meta: [string, string][] = [
    ["Medium", p.medium === "both" ? "Photographs and film" : p.medium === "photo" ? "Photographs" : "Film"],
    ["Category", p.categories.join(", ")],
    ...(p.year ? [["Year", String(p.year)] as [string, string]] : []),
    ...(p.client ? [["Client", p.client] as [string, string]] : []),
    ["By", identity.name],
    ...p.credits.map((c) => [c.role, c.name] as [string, string]),
    ["In this project", [p.photos.length && `${p.photos.length} photographs`, p.films.length && `${p.films.length} film${p.films.length > 1 ? "s" : ""}`].filter(Boolean).join(", ")],
  ];

  return (
    <Section bd={p.backdrop} on={p.on} label={p.title} className="relative overflow-hidden">
      <div className="relative min-h-[100svh] px-[var(--gutter)] pb-24 pt-24 md:pb-16">
        <h1 className="display pointer-events-none relative z-20 whitespace-nowrap md:absolute md:left-[-0.02em] md:top-[22vh]" style={{ fontSize: fitW(p.title, 30) }}>
          {p.title}
        </h1>
        <div className="relative z-10 grid grid-cols-12 gap-x-[var(--gutter)] gap-y-8 md:min-h-[calc(100svh-10rem)]">
          <div className="col-span-10 col-start-2 -mt-[12vw] md:col-span-4 md:col-start-6 md:mt-[10vh] md:self-start">
            {leadFilm ? (
              <button
                onClick={() => openFilm(allFilms, allFilms.findIndex((f) => f.key === leadFilm.key))}
                className="group frame block aspect-[9/16] w-full md:mx-auto md:h-[74vh] md:w-auto"
                aria-label={`Play ${leadFilm.title}, ${leadFilm.duration}`}
              >
                <Poster film={leadFilm} sizes="(min-width: 768px) 42vh, 80vw" priority live />
                <span className="ui absolute bottom-0 left-0 bg-[var(--page-bd)] px-3 py-2 text-[17px] text-[var(--page-on)]">
                  Play with sound &nbsp;{leadFilm.duration}
                </span>
              </button>
            ) : (
              <button
                onClick={() => openPhoto(photos, 0)}
                className="group frame block w-full"
                style={{ aspectRatio: `${leadPhoto.w} / ${leadPhoto.h}` }}
                aria-label={`View ${p.title}, photograph 1`}
              >
                <Image src={leadPhoto.src} alt={leadPhoto.alt} fill priority sizes="(min-width: 768px) 34vw, 80vw" />
              </button>
            )}
          </div>

          <div className="col-span-12 md:col-span-3 md:col-start-10 md:self-end">
            <p className="text-[20px] leading-snug">{p.summary}</p>
            <dl className="mt-6 grid grid-cols-[120px_1fr] gap-y-2 border-t border-current/25 pt-4">
              {meta.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="ui-sm quiet">{k}</dt>
                  <dd className="ui">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** The sequence: stills set as alternating spreads, films as tall frames with their running times. */
export function ProjectSequence({ p }: { p: Project }) {
  const { openFilm, openPhoto } = useMedia();
  const photos = p.photos.map((ph) => ({ ...ph, project: p.title }));
  const restPhotos = p.medium === "film" ? [] : p.photos.slice(1);
  const films = p.medium === "film" ? p.films.slice(1) : p.films;

  if (!restPhotos.length && !films.length && !p.note) return null;

  return (
    <Section bd={p.backdrop} on={p.on} label={`${p.title}, sequence`} className="px-[var(--gutter)] pb-28 pt-8">
      {restPhotos.length > 0 && (
        <div className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-[8vh]">
          {restPhotos.map((ph, k) => {
            const pos = [
              "col-span-12 md:col-span-5 md:col-start-2",
              "col-span-8 col-start-5 md:col-span-3 md:col-start-9 md:mt-[24vh]",
              "col-span-10 md:col-span-6 md:col-start-4",
            ][k % 3];
            return (
              <button
                key={ph.src}
                onClick={() => openPhoto(photos, k + 1)}
                className={`group frame rise ${pos}`}
                style={{ aspectRatio: `${ph.w} / ${ph.h}` }}
                aria-label={`View ${p.title}, photograph ${k + 2}`}
              >
                <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 768px) 45vw, 90vw" className="transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
              </button>
            );
          })}
        </div>
      )}

      {films.length > 0 && (
        <div className="mt-[10vh] flex flex-wrap items-end gap-[var(--gutter)]">
          <h2 className="display w-full text-[clamp(48px,7vw,120px)]">{p.medium === "both" ? "The films" : "More from this project"}</h2>
          {films.map((f) => (
            <div key={f.key} className="w-[64vw] md:w-[24vw]">
              <button
                onClick={() => openFilm(allFilms, allFilms.findIndex((a) => a.key === f.key))}
                className="group frame rise block aspect-[9/16] w-full"
                aria-label={`Play ${f.title}, ${f.duration}`}
              >
                <Poster film={f} sizes="(min-width: 768px) 24vw, 64vw" />
              </button>
              <p className="ui mt-2 flex justify-between">
                <span>{f.title}</span>
                <span className="quiet">{f.duration}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {p.note && (
        <p className="ui-sm mt-14 max-w-[60ch] border-t border-current/25 pt-3">
          <span className="quiet">Note for review: </span>
          {p.note}
        </p>
      )}
    </Section>
  );
}

/** Next project: a full band in the next project's own colour. */
export function NextProject({ next }: { next: Project }) {
  const t = next.photos[0]?.src ?? next.films[0]?.poster;
  return (
    <Section bd={next.backdrop} on={next.on} label="Next project" className="relative overflow-hidden">
      <Link href={`/work/${next.slug}`} className="group relative block min-h-[70svh] px-[var(--gutter)] pb-24 pt-20">
        <p className="ui text-[18px]">Next project</p>
        <p className="display mt-6 whitespace-nowrap transition-transform duration-700 group-hover:translate-x-[2vw]" style={{ fontSize: fitW(next.title, 26, 190) }}>
          {next.title}
        </p>
        {t && (
          <span className="frame absolute bottom-[12vh] right-[8vw] hidden aspect-[2/3] w-[14vw] transition-transform duration-700 group-hover:-translate-y-4 md:block">
            <Image src={t} alt="" fill sizes="14vw" />
          </span>
        )}
      </Link>
    </Section>
  );
}
