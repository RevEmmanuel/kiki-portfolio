/**
 * Enquiry validation and sanitising, shared by the API route (authoritative) and the form (early feedback).
 * Pure functions, no dependencies.
 */

export const SERVICES = ["Photography", "Film", "Photography and film", "Something else"] as const;
export type Service = (typeof SERVICES)[number];

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  service: Service;
  date: string;
  budget: string;
  message: string;
};

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

const LIMITS = { name: 100, email: 200, phone: 30, budget: 100, message: 4000 } as const;

/** Trim, drop control characters (keeping newlines in the message), collapse runs of spaces. */
export function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  let v = value.normalize("NFC");
  v = multiline ? v.replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n") : v.replace(/\s+/g, " ");
  // eslint-disable-next-line no-control-regex
  v = v.replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, "");
  return v.trim().slice(0, max);
}

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i;
const PHONE = /^[+()\-.\s\d]{7,30}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validate(input: Record<string, unknown>): { data?: Enquiry; errors?: FieldErrors } {
  const data: Enquiry = {
    name: clean(input.name, LIMITS.name),
    email: clean(input.email, LIMITS.email).toLowerCase(),
    phone: clean(input.phone, LIMITS.phone),
    service: (SERVICES as readonly string[]).includes(String(input.service)) ? (input.service as Service) : SERVICES[2],
    date: clean(input.date, 10),
    budget: clean(input.budget, LIMITS.budget),
    message: clean(input.message, LIMITS.message, true),
  };

  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Add your name.";
  if (!EMAIL.test(data.email)) errors.email = "Add an email address Kiki can reply to.";
  if (data.phone && !PHONE.test(data.phone)) errors.phone = "Use digits, spaces and + only, or leave the phone blank.";
  if (data.date && (!DATE.test(data.date) || Number.isNaN(Date.parse(data.date)))) errors.date = "Pick a date, or leave it blank.";
  if (data.message.length < 10) errors.message = "Tell Kiki a little about the project (at least 10 characters).";
  if (input.service && !(SERVICES as readonly string[]).includes(String(input.service))) errors.service = "Choose what you need.";

  return Object.keys(errors).length ? { errors } : { data };
}

/** Escape text for the HTML version of the email. */
export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** A plain summary used for the email body and the WhatsApp/email hand-off. */
export function summarise(e: Partial<Enquiry>, firstName = "Kiki"): string {
  return [
    `Hello ${firstName}, I'd like to book: ${e.service ?? ""}.`,
    e.name && `Name: ${e.name}`,
    e.email && `Email: ${e.email}`,
    e.phone && `Phone: ${e.phone}`,
    e.date && `Date: ${e.date}`,
    e.budget && `Budget: ${e.budget}`,
    e.message && `\n${e.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}
