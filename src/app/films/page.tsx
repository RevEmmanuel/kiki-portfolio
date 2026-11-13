import type { Metadata } from "next";
import { pageOg } from "@/lib/site";
import { Section } from "@/components/Backdrop";
import { BookBand } from "@/components/Closing";
import { FilmRow, LightTable, MobileReel, PlayAllButton } from "@/components/FilmsBrowser";
import { allFilms } from "@/content/projects";

export const metadata: Metadata = {
  title: "Films",
  description: "Vertical fashion and brand films by Kiki Williams.",
  alternates: { canonical: "/films" },
  openGraph: pageOg("Films", "/films"),
};

const chapters = ["Fashion films", "Brand & events", "Culture"]; // empty chapters are skipped

export default function Films() {
  return (
    <>
      <Section bd="#0d0c0b" on="paper" label="Films" className="px-[var(--gutter)] pb-14 pt-28 md:pt-32">
        <p className="kicker flex items-center gap-3">
          <span className="rec-dot" aria-hidden /> Screening room · {allFilms.length} films
        </p>
        <h1 className="display mt-6 text-[clamp(110px,26vw,460px)] leading-[0.78]">
          Films<span className="accent text-signal text-[0.5em]"> standing up</span>
        </h1>
        <div className="mt-8 grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="max-w-[34ch] text-[21px] leading-snug">
              {allFilms.length} films, all cut for the vertical screen, so they are shown standing up.
            </p>
          </div>
          <div className="md:col-span-7 md:text-right">
            <PlayAllButton />
          </div>
        </div>
      </Section>

      <LightTable />
      <MobileReel />

      {chapters.map((c) => {
        const films = allFilms.filter((f) => f.project.categories.includes(c));
        if (!films.length) return null;
        return (
          <Section key={c} bd="#0d0c0b" on="paper" label={c} className="px-[var(--gutter)] py-14">
            <div className="mb-6 flex items-baseline justify-between border-t border-current/20 pt-4">
              <h2 className="display text-[clamp(44px,6vw,96px)]">{c}</h2>
              <p className="ui quiet">{films.length} film{films.length > 1 ? "s" : ""}</p>
            </div>
            <FilmRow films={films} />
          </Section>
        );
      })}

      <BookBand />
    </>
  );
}
