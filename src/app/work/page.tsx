import type { Metadata } from "next";
import { pageOg } from "@/lib/site";
import { Section } from "@/components/Backdrop";
import { BookBand } from "@/components/Closing";
import { WorkBrowser } from "@/components/work/WorkBrowser";
import { allFilms, projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Every project by Kiki Williams: fashion and editorial photography, beauty portraits, fashion films and brand films.",
  alternates: { canonical: "/work" },
  openGraph: pageOg("Work", "/work"),
};

export default function WorkPage() {
  const photos = projects.reduce((n, p) => n + p.photos.length, 0);
  return (
    <>
      <Section bd="#efeae0" on="ink" label="Work" className="px-[var(--gutter)] pb-28 pt-[120px] md:pt-[140px]">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h1 className="display text-[clamp(110px,24vw,400px)] leading-[0.78] md:col-span-8">
            Work<span className="text-signal">.</span>
          </h1>
          <div className="md:col-span-4 md:pb-4">
            <p className="kicker flex items-center gap-2">
              <span className="rec-dot" aria-hidden /> Archive · {projects.length} projects
            </p>
            <p className="mt-4 max-w-[34ch] text-[20px] leading-snug">
              {photos} photographs and {allFilms.length} films across fashion, beauty, brands and one walk in the rainforest. Filter, or switch to the index.
            </p>
          </div>
        </div>
        <div className="mt-12">
          <WorkBrowser />
        </div>
      </Section>
      <BookBand />
    </>
  );
}
