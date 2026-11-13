/**
 * Portfolio content model.
 *
 * Everything the site shows comes from this file, so adding a project means adding
 * one object here. Media is generated from the Drive masters by `npm run media`
 * (see scripts/media.mjs), which also writes media.generated.json: real pixel sizes,
 * poster frames, preview loops and durations. Streaming IDs live in stream-ids.json.
 *
 * Only projects in this file are published. Withheld material is listed, with the
 * reason, in withheld.ts and is checked by `npm run check:private`.
 *
 * Fields marked `null` or wrapped in [brackets] are unknown and must be confirmed.
 */

export type Medium = "photo" | "film" | "both";

export type Photo = {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** Exact original filename in Drive */
  file: string;
  /** CSS object-position used when the frame crops the picture */
  focus?: string;
};

export type Film = {
  /** Stable key: names the poster, the loop and the Cloudflare Stream entry */
  key: string;
  title: string;
  poster: string | null;
  /** Running time, m:ss */
  duration: string;
  /** Source master in Drive (never used for playback) */
  driveId: string;
  file: string;
  /** Silent 6–8 s preview loop, when one has been generated */
  loop?: string;
  burnedInText?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  medium: Medium;
  categories: string[];
  /** Backdrop colour sampled from the work */
  backdrop: string;
  /** Text colour that passes 4.5:1 on the backdrop */
  on: "ink" | "paper";
  /** One sentence, observed from the work (not client-supplied) */
  summary: string;
  year: string | null;
  client: string | null;
  /** Verified credits only. Empty = roles still to confirm with Kiki. */
  credits: { role: string; name: string }[];
  photos: Photo[];
  films: Film[];
  note?: string;
};

import generated from "./media.generated.json";

const P = "/media/photo/";
const F = "/media/film/";

export const projects: Project[] = [
  {
    slug: "glitz",
    title: "Glitz",
    medium: "photo",
    categories: ["Fashion & editorial"],
    backdrop: "#7A1E3C",
    on: "paper",
    summary:
      "A printed mesh dress against a magenta seamless, cut by a single hard circle of light.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "glitz-1085.jpg", w: 896, h: 1345, alt: "Woman with hands behind her head in front of a pink spotlight circle on a magenta backdrop", file: "CG7A1085  Y R.jpeg" },
      { src: P + "glitz-1109.jpg", w: 924, h: 1313, alt: "Full-length portrait in a ruffled printed gown, her shadow thrown across a pink spotlight", file: "CG7A1109  Y R.jpeg" },
      { src: P + "glitz-1072.jpg", w: 896, h: 1345, alt: "Close portrait, hands raised to a high ponytail, deep magenta backdrop", file: "CG7A1072  Y R-2.jpeg" },
    ],
    films: [],
  },
  {
    slug: "shine",
    title: "Shine",
    medium: "film",
    categories: ["Fashion films"],
    backdrop: "#E2B42A",
    on: "ink",
    summary:
      "A couple, a vintage yellow convertible and a tulle gown, edited as stacked vertical frames.",
    year: null,
    client: null,
    credits: [],
    photos: [],
    films: [
      { key: "shine", title: "Shine", poster: F + "shine.jpg", duration: "0:29", driveId: "1MZIkLh0OF5dKjKqapDE6Rwpt6xQPjv47", file: "S2.mov" },
    ],
  },
  {
    slug: "bad-girl",
    title: "Bad Girl",
    medium: "photo",
    categories: ["Fashion & editorial"],
    backdrop: "#B8261F",
    on: "paper",
    summary: "Sheer black, patent leggings and sculpted sunglasses on a red floor.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "badgirl-9602.jpg", w: 924, h: 1300, alt: "Model seated on a red seamless floor in sheer black and dark sunglasses", file: "DSC09602 copy.jpeg" },
      { src: P + "badgirl-9576.jpg", w: 924, h: 1315, alt: "Model lying upside down on red, one leg raised, shot from above", file: "DSC09576 copy.jpeg" },
    ],
    films: [],
  },
  {
    slug: "saskay",
    title: "Saskay",
    medium: "film",
    categories: ["Fashion films"],
    backdrop: "#2B2140",
    on: "paper",
    summary: "A slow portrait film in violet low light: closed eyes, comb earrings, striped cloth.",
    year: null,
    client: null,
    credits: [],
    photos: [],
    films: [
      { key: "saskay", title: "Saskay", poster: F + "saskay.jpg", duration: "0:24", driveId: "1t-psrKzSX1kJXFi9SNtzpQze0etPxExy", file: "S.mov" },
    ],
  },
  {
    slug: "black-chedder",
    title: "Black Chedder",
    medium: "both",
    categories: ["Fashion & editorial", "Fashion films"],
    backdrop: "#DCE3E1",
    on: "ink",
    summary:
      "One brand, two looks: black on a white studio cyc, then woven stripes against sun-bleached walls.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "blackchedder-still.jpg", w: 952, h: 1270, alt: "Woman in a striped woven wrap holding a silver bag, seated against a white wall", file: "Cheddar.jpg" },
    ],
    films: [
      { key: "black-chedder-studio", title: "Black Chedder, studio", poster: F + "blackchedder.jpg", duration: "0:16", driveId: "1nlOjm6QqxTtIzWgQ7RW8bsp1MPBmkQeT", file: "Cheddar.MOV" },
      { key: "black-chedder-rooftop", title: "Black Chedder, rooftop", poster: F + "blackchedder-rooftop.jpg", duration: "0:19", driveId: "1fAgBoPAxN_E30JJdqoDEx8M7X4H01RhQ", file: "Cheddar.MOV" },
    ],
    note: "The rooftop film is filed in the Ojude Oba folder in Drive; it shows the same outfit as Cheddar.jpg. To confirm.",
  },
  {
    slug: "extra-pure-skin",
    title: "Extra Pure Skin",
    medium: "photo",
    categories: ["Commercial"],
    backdrop: "#DFAE7B",
    on: "ink",
    summary: "Shower gel styled with gold crystal heels and a mirrored tray on warm peach.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "eps-8468.jpg", w: 948, h: 1288, alt: "Extra Pure Skin shower gel bottle in front of a gold crystal-strapped high heel on peach", file: "2X7A8468.jpeg" },
      { src: P + "eps-8463.jpg", w: 1600, h: 2252, alt: "Bottle lying on a mirrored tray with gold handles, reflected below", file: "2X7A8463.jpeg" },
      { src: P + "eps-8486.jpg", w: 1600, h: 2029, alt: "Bottle standing on a mirrored tray beside white flowers", file: "2X7A8486-3.jpeg" },
      { src: P + "eps-8419.jpg", w: 1600, h: 2400, alt: "Single bottle centred on a seamless peach set", file: "2X7A8419.jpeg" },
    ],
    films: [],
  },
  {
    slug: "halle",
    title: "Halle",
    medium: "photo",
    categories: ["Beauty & portrait"],
    backdrop: "#3D3029",
    on: "paper",
    summary: "Two looks: a flower crown on tan, and an oxblood bob held behind an armful of peonies.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "halle-8893.jpg", w: 896, h: 1345, alt: "Woman with an oxblood bob and a white flower in her hair, holding pink peonies, looking away", file: "REP_8893 copy.jpeg" },
      { src: P + "halle-6653.jpg", w: 896, h: 1345, alt: "Seated portrait wearing a crown of silk flowers on a tan backdrop", file: "REP_6653 copy.jpeg" },
      { src: P + "halle-8900.jpg", w: 896, h: 1345, alt: "Oxblood bob, looking into the lens, peonies held to her chest", file: "REP_8900 copy.jpeg" },
    ],
    films: [],
  },
  {
    slug: "birthday",
    title: "Birthday",
    medium: "photo",
    categories: ["Beauty & portrait"],
    backdrop: "#141312",
    on: "paper",
    summary: "A low-key birthday portrait set: one spotlight, white roses and a black heart cake.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "birthday-2437.jpg", w: 1600, h: 2287, alt: "Woman in sheer black gloves behind a black heart-shaped cake", file: "2X7A2437.jpeg" },
      { src: P + "birthday-2280.jpg", w: 1600, h: 2214, alt: "Laughing in a black dress, holding roses in a pool of spotlight", file: "2X7A2280.jpeg" },
      { src: P + "birthday-2486.jpg", w: 1600, h: 2015, alt: "Seated on the floor beside the cake and a bouquet, hand raised to her face", file: "2X7A2486.jpeg" },
      { src: P + "birthday-2296.jpg", w: 1600, h: 2144, alt: "Blowing a kiss inside the spotlight circle", file: "2X7A2296.jpeg" },
    ],
    films: [],
  },
  {
    slug: "jimi",
    title: "Jimi",
    medium: "photo",
    categories: ["Fashion & editorial"],
    backdrop: "#A0071B",
    on: "paper",
    summary: "Menswear on a crimson seamless: denim, beads and a stool.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "jimi-1684.jpg", w: 896, h: 1345, alt: "Man seated on a red floor pulling up a white sock, light denim and black knit", file: "2X7A1684 copy 2-2.jpeg" },
      { src: P + "jimi-1619.jpg", w: 896, h: 1345, alt: "Close portrait leaning on a wooden stool, beaded bracelets, striped shirt", file: "2X7A1619 copy 2.jpeg" },
      { src: P + "jimi-untitled.jpg", w: 896, h: 1345, alt: "Smiling in tinted glasses, seated on a box against crimson", file: "untitled-.jpeg" },
    ],
    films: [],
  },
  {
    slug: "vandora",
    title: "Vandora",
    medium: "film",
    categories: ["Fashion films", "Brand & events"],
    backdrop: "#C0391B",
    on: "paper",
    summary: "An orange beaded gown up close, then a neon night for the label's event.",
    year: null,
    client: null,
    credits: [],
    photos: [],
    films: [
      { key: "vandora", title: "Vandora", poster: F + "vandora.jpg", duration: "0:33", driveId: "1RF5u7htqGbbvgNoiQ4LhEACsZfKZWBAy", file: "Vandora.mov" },
      { key: "bmoni-x-vandora", title: "BMONI x Vandora", poster: F + "bmoni.jpg", duration: "1:01", driveId: "1hiHLgGl8leB_MfHWIBZOny8zYn7ys-Ml", file: "BMONI X Vandora.mov" },
    ],
  },
  {
    slug: "future-face-2024",
    title: "Future Face 2024",
    medium: "film",
    categories: ["Brand & events"],
    backdrop: "#9EA8BC",
    on: "ink",
    summary: "Backstage at a fashion show: make-up chairs, shoes, dressing and the walk.",
    year: "2024",
    client: null,
    credits: [],
    photos: [],
    films: [
      { key: "future-face-2024", title: "Future Face 2024", poster: F + "futureface.jpg", duration: "0:44", driveId: "1Fh8S-aAhVf7nPVKelb4gg0a_7FnXlYR3", file: "FF.MOV" },
    ],
    note: "A cosmetics brand's logo is visible backstage. Confirm usage rights.",
  },
  {
    slug: "sketchbywale",
    title: "SketchbyWale",
    medium: "film",
    categories: ["Brand & events"],
    backdrop: "#E3E2D9",
    on: "ink",
    summary: "A streetwear launch film that opens in kinetic type on crumpled paper.",
    year: null,
    client: null,
    credits: [],
    photos: [],
    films: [
      { key: "sketchbywale", title: "SketchbyWale", poster: F + "sketchbywale.jpg", duration: "1:03", driveId: "1_rj7BfCRqgLPo5l6Jbcuy1QVdbeyAEIO", file: "SBW.MOV", burnedInText: true },
    ],
  },
  {
    slug: "gaga-agency",
    title: "GAGA Agency",
    medium: "film",
    categories: ["Brand & events"],
    backdrop: "#7C8687",
    on: "ink",
    summary: "Model content for an agency, with the set, the lights and the crew left in frame.",
    year: null,
    client: null,
    credits: [],
    photos: [],
    films: [
      { key: "gaga-agency", title: "GAGA Agency", poster: F + "gaga.jpg", duration: "1:02", driveId: "1chzY76-uwnJuQZzpJ68qD6Abf-Je994g", file: "GAGA.MOV" },
    ],
  },
  {
    slug: "nature",
    title: "Nature",
    medium: "photo",
    categories: ["Personal"],
    backdrop: "#22301A",
    on: "paper",
    summary: "A rainforest boardwalk, canopy and the monkeys who use it.",
    year: null,
    client: null,
    credits: [],
    photos: [
      { src: P + "nature-2986.jpg", w: 1080, h: 1616, alt: "Wooden boardwalk through dense rainforest with two monkeys on the rail", file: "_DSC2986 (2).jpeg" },
    ],
    films: [],
  },
];

type Generated = {
  photos: Record<string, { w: number; h: number }>;
  films: Record<string, { poster?: string; loop?: string; duration?: string }>;
};
const gen = generated as Generated;

// Apply what the media pipeline measured and generated
for (const p of projects) {
  for (const ph of p.photos) Object.assign(ph, gen.photos[ph.src] ?? {});
  for (const f of p.films) {
    const g = gen.films[f.key];
    if (!g) continue;
    if (g.poster) f.poster = g.poster;
    if (g.loop) f.loop = g.loop;
    if (g.duration) f.duration = g.duration;
  }
}

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const photoProjects = projects.filter((p) => p.photos.length > 0);
export const filmProjects = projects.filter((p) => p.films.length > 0);

export const allFilms = filmProjects.flatMap((p) =>
  p.films.map((f) => ({ ...f, project: p })),
);

export type FilmWithProject = (typeof allFilms)[number];

export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};

/** The homepage opening pairs one still with one film; the page takes the pair's colour. */
export const openingPairs = [
  { still: "glitz", film: "saskay", backdrop: "#6E1C38", on: "paper" as const },
  { still: "bad-girl", film: "vandora", backdrop: "#B3241D", on: "paper" as const },
  { still: "extra-pure-skin", film: "shine", backdrop: "#DDAA6E", on: "ink" as const },
  { still: "black-chedder", film: "black-chedder", backdrop: "#DCE3E1", on: "ink" as const },
];

export const selectedWork = ["glitz", "shine", "bad-girl", "saskay", "black-chedder", "extra-pure-skin"];

export const identity = {
  name: "Kiki Williams",
  title: "Videographer / Photographer / Creator",
  phone: { display: "0818 378 3922", href: "tel:+2348183783922" },
  whatsapp: { display: "0818 378 3922", href: "https://wa.me/2348183783922" },
  instagram: { display: "@kikii.williams", href: "https://instagram.com/kikii.williams" },
  email: { display: "kikiwill7.kw@gmail.com", href: "mailto:kikiwill7.kw@gmail.com" },
};

/** Contact channels in the order they are offered: WhatsApp first, as the fastest way to book. */
export const channels = [
  { label: "WhatsApp", ...identity.whatsapp, external: true },
  { label: "Phone", ...identity.phone, external: false },
  { label: "Email", ...identity.email, external: false },
  { label: "Instagram", ...identity.instagram, external: true },
];
