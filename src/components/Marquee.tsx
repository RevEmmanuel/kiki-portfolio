import { Section } from "./Backdrop";

/** A slow ticker of what Kiki makes, between the archive and the booking screen. */
export function Marquee({ words, bd = "#efeae0", on = "ink" as const }: { words: string[]; bd?: string; on?: "ink" | "paper" }) {
  const row = (
    <span className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="display px-[2vw] text-[clamp(64px,11vw,180px)] leading-none">{w}</span>
          <span aria-hidden className="inline-block h-[0.9vw] min-h-2 w-[0.9vw] min-w-2 rounded-full bg-current" />
        </span>
      ))}
    </span>
  );
  return (
    <Section bd={bd} on={on} label="Services" className="overflow-hidden py-10 md:py-14">
      <p className="sr-only">{words.join(", ")}</p>
      <div aria-hidden className="marquee flex w-max">
        {row}
        {row}
      </div>
    </Section>
  );
}
