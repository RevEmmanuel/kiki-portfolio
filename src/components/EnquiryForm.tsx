"use client";

import { useEffect, useRef, useState } from "react";
import { identity } from "@/content/projects";
import { SERVICES, summarise, validate, type Enquiry, type FieldErrors } from "@/lib/enquiry";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; via: "email" | "whatsapp" } | { kind: "error"; message: string };

const first = identity.name.split(" ")[0];

/** Enquiry form: posts to /api/enquiry (Resend). WhatsApp and email stay available as alternatives. */
export function EnquiryForm({ online = true }: { online?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  const [service, setService] = useState<string>(SERVICES[2]);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<Partial<Enquiry>>({});

  useEffect(() => {
    startedAt.current = Date.now();
    // arriving from a service page: pick the service and start the message
    const q = new URLSearchParams(window.location.search);
    const svc = q.get("service");
    if (svc && (SERVICES as readonly string[]).includes(svc)) setService(svc);
    const about = q.get("about");
    const msg = formRef.current?.elements.namedItem("message") as HTMLTextAreaElement | null;
    if (about && msg && !msg.value) msg.value = `I'd like to talk about ${about.slice(0, 80).toLowerCase()}. `;
  }, []);

  const read = (): Record<string, string> => {
    const f = new FormData(formRef.current!);
    return { ...Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)])), service };
  };

  const handoff = (v: Partial<Enquiry>) => summarise({ ...v, service: (v.service ?? service) as Enquiry["service"] }, first);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const raw = read();
    const { data, errors: errs } = validate(raw);
    setValues(raw as Partial<Enquiry>);
    if (!data) {
      setErrors(errs ?? {});
      setState({ kind: "error", message: "Check the highlighted fields." });
      const firstBad = Object.keys(errs ?? {})[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setErrors({});
    if (!online) {
      // no email service configured: hand the finished enquiry straight to WhatsApp
      window.open(`${identity.whatsapp.href}?text=${encodeURIComponent(handoff(data))}`, "_blank", "noopener,noreferrer");
      setState({ kind: "sent", via: "whatsapp" });
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...raw, startedAt: startedAt.current }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors };
      if (res.ok && body.ok) {
        setState({ kind: "sent", via: "email" });
        return;
      }
      if (body.fields) setErrors(body.fields);
      setState({ kind: "error", message: body.error ?? "The enquiry couldn't be sent. Try again, or use WhatsApp or email." });
    } catch {
      setState({ kind: "error", message: "You seem to be offline. Try again, or use WhatsApp or email." });
    }
  }

  const field = "mt-2 w-full border-0 border-b bg-transparent py-2 text-[20px] outline-none focus:border-current";
  const border = (k: keyof Enquiry) => (errors[k] ? "border-current" : "border-current/40");
  const err = (k: keyof Enquiry) =>
    errors[k] ? (
      <span id={`${k}-error`} className="ui-sm mt-2 block">
        {errors[k]}
      </span>
    ) : null;
  const aria = (k: keyof Enquiry) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });

  if (state.kind === "sent")
    return (
      <div role="status" className="border-t border-current/30 pt-6">
        <p className="display text-[clamp(48px,6vw,96px)]">{state.via === "email" ? "Enquiry sent" : "Over to WhatsApp"}</p>
        <p className="mt-4 max-w-[44ch] text-[19px]">
          {state.via === "email"
            ? `It’s in ${first}’s inbox. She’ll reply to ${values.email}. For anything urgent, message her on WhatsApp.`
            : `Your enquiry is written out in WhatsApp. Press send there and ${first} will pick it up.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a className="cta on-ink" target="_blank" rel="noopener noreferrer" href={identity.whatsapp.href}>
            WhatsApp {identity.whatsapp.display}
          </a>
          <button
            className="ui link"
            onClick={() => {
              setValues({});
              setState({ kind: "idle" });
              startedAt.current = Date.now();
            }}
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );

  const sending = state.kind === "sending";

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="grid gap-8" aria-busy={sending}>
      <fieldset>
        <legend className="ui text-[18px]">What do you need?</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {SERVICES.map((k) => (
            <label
              key={k}
              className={`ui cursor-pointer border px-4 py-2.5 text-[17px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 ${service === k ? "border-current bg-paper text-ink" : "border-current/40"}`}
            >
              <input type="radio" name="service" value={k} checked={service === k} onChange={() => setService(k)} className="sr-only" />
              {k}
            </label>
          ))}
        </div>
      </fieldset>

      {/* honeypot: hidden from people, tempting to bots */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <label className="ui text-[16px]">
          Your name
          <input name="name" defaultValue={values.name} autoComplete="name" required className={`${field} ${border("name")}`} {...aria("name")} />
          {err("name")}
        </label>
        <label className="ui text-[16px]">
          Email
          <input name="email" defaultValue={values.email} type="email" autoComplete="email" required className={`${field} ${border("email")}`} {...aria("email")} />
          {err("email")}
        </label>
        <label className="ui text-[16px]">
          Phone <span className="quiet">(optional)</span>
          <input name="phone" defaultValue={values.phone} type="tel" autoComplete="tel" className={`${field} ${border("phone")}`} {...aria("phone")} />
          {err("phone")}
        </label>
        <label className="ui text-[16px]">
          Shoot date <span className="quiet">(optional)</span>
          <input name="date" defaultValue={values.date} type="date" className={`${field} ${border("date")}`} {...aria("date")} />
          {err("date")}
        </label>
        <label className="ui text-[16px] md:col-span-2">
          Budget <span className="quiet">(optional)</span>
          <input name="budget" defaultValue={values.budget} className={`${field} ${border("budget")}`} />
        </label>
      </div>

      <label className="ui text-[16px]">
        What are you making?
        <textarea
          name="message"
          defaultValue={values.message}
          rows={5}
          required
          className={`${field} ${border("message")} resize-y`}
          placeholder="Brand, product or person; where the photographs or films will be used."
          {...aria("message")}
        />
        {err("message")}
      </label>

      {state.kind === "error" && (
        <div role="alert" className="border-l-2 border-current pl-4">
          <p className="ui text-[17px]">{state.message}</p>
          <p className="mt-2 text-[16px] opacity-85">
            Or send the same details{" "}
            <a className="link" target="_blank" rel="noopener noreferrer" href={`${identity.whatsapp.href}?text=${encodeURIComponent(handoff(values))}`}>
              on WhatsApp
            </a>{" "}
            or{" "}
            <a className="link" href={`${identity.email.href}?subject=${encodeURIComponent("Enquiry from the website")}&body=${encodeURIComponent(handoff(values))}`}>
              by email
            </a>
            .
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" className="cta on-ink disabled:opacity-60" disabled={sending}>
          {sending ? "Sending enquiry" : online ? "Send enquiry" : "Send on WhatsApp"}
        </button>
        {online && <a
          className="ui text-[17px] link"
          target="_blank"
          rel="noopener noreferrer"
          href={identity.whatsapp.href}
          onClick={(e) => {
            // carry whatever has been typed so far into WhatsApp
            e.currentTarget.href = `${identity.whatsapp.href}?text=${encodeURIComponent(handoff(read() as Partial<Enquiry>))}`;
          }}
        >
          Send on WhatsApp instead
        </a>}
      </div>
    </form>
  );
}
