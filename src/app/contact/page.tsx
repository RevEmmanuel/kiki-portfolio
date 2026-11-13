import type { Metadata } from "next";
import { pageOg } from "@/lib/site";
import { Section } from "@/components/Backdrop";
import { EnquiryForm } from "@/components/EnquiryForm";
import { channels, identity } from "@/content/projects";

export const metadata: Metadata = {
  title: "Book a shoot",
  description: "Book Kiki Williams for photographs and films: WhatsApp, phone, email, Instagram or a short enquiry form.",
  alternates: { canonical: "/contact" },
  openGraph: pageOg("Book a shoot", "/contact"),
};

export default function Contact() {
  const wa = channels[0];
  return (
    <>
      <Section bd="#ff3d1f" on="ink" label="Book a shoot" className="px-[var(--gutter)] pb-20 pt-[120px] md:pt-[150px]">
        <p className="kicker flex items-center gap-3">
          <span aria-hidden className="inline-block h-[9px] w-[9px] rounded-full bg-ink" /> Now booking
        </p>
        <h1 className="display mt-6 text-[clamp(96px,18vw,330px)] leading-[0.78]">
          Book a<br />
          <span className="accent">shoot</span>
        </h1>
        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[34ch] text-[21px] leading-snug md:text-[24px]">
            The fastest way to reach {identity.name.split(" ")[0]} is WhatsApp. For campaigns, send the brief by email or use the form below.
          </p>
          <a href={wa.href} target="_blank" rel="noopener noreferrer" className="cta !min-h-[64px] !bg-ink !px-8 !text-[19px] !text-paper hover:!bg-paper hover:!text-ink">
            WhatsApp {wa.display} →
          </a>
        </div>
      </Section>

      <Section bd="#0d0c0b" on="paper" label="Enquiry" className="px-[var(--gutter)] pb-32 pt-24 [color-scheme:dark]">
        <div className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-14">
          <div className="col-span-12 md:col-span-4">
            <h2 className="display text-[clamp(56px,6vw,96px)] leading-[0.88]">
              Every <span className="accent text-signal">way in</span>
            </h2>
            <ul className="mt-10 border-b border-paper/20">
              {channels.map((c) => (
                <li key={c.label} className="border-t border-paper/20">
                  <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex min-h-[72px] items-center justify-between gap-4 py-3">
                    <span>
                      <span className="kicker block opacity-60">{c.label}</span>
                      <span className="display mt-1 block break-all text-[clamp(28px,2.6vw,40px)] normal-case leading-[0.95] transition-colors group-hover:text-signal">{c.display}</span>
                    </span>
                    <span aria-hidden className="text-[24px] transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <h2 className="display text-[clamp(56px,6vw,96px)] leading-[0.88]">
              Or tell her <span className="accent">here</span>
            </h2>
            <div className="mt-10">
              <EnquiryForm online={Boolean(process.env.RESEND_API_KEY)} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
