import type { Service } from "@/lib/enquiry";

/**
 * What Kiki offers, described only from the work in the archive. Each discipline points at
 * the real projects that show it; nothing here is a claim the portfolio can't back up.
 */
export type Discipline = {
  slug: string;
  n: string;
  name: string;
  /** headline split: condensed caps + a serif accent word */
  line: [string, string];
  pitch: string;
  outputs: string[];
  work: string[]; // project slugs
  enquire: Service;
  bd: string;
  on: "ink" | "paper";
};

export const disciplines: Discipline[] = [
  {
    slug: "fashion-editorial",
    n: "01",
    name: "Fashion & editorial photography",
    line: ["Fashion &", "editorial"],
    pitch:
      "Lookbook and editorial stills built on one strong colour and one decisive light: magenta spotlights, red floors, crimson seamless.",
    outputs: ["Lookbook and campaign stills", "Editorial portraits", "Styled studio sets in a single colour"],
    work: ["glitz", "bad-girl", "jimi", "black-chedder"],
    enquire: "Photography",
    bd: "#7A1E3C",
    on: "paper",
  },
  {
    slug: "fashion-films",
    n: "02",
    name: "Fashion films",
    line: ["Fashion", "films"],
    pitch:
      "Short films cut vertical for the phone screen: a couple in a yellow convertible, a slow portrait in violet light, a beaded gown up close.",
    outputs: ["Vertical 9:16 films for Reels and TikTok", "Slow portrait and mood films", "Stills and film from the same day"],
    work: ["shine", "saskay", "vandora", "black-chedder"],
    enquire: "Film",
    bd: "#E2B42A",
    on: "ink",
  },
  {
    slug: "beauty-portrait",
    n: "03",
    name: "Beauty & portrait",
    line: ["Beauty &", "portrait"],
    pitch: "Close, considered portraits: flower crowns on tan, an oxblood bob behind peonies, a low-key birthday set with one spotlight.",
    outputs: ["Beauty close-ups", "Personal and celebration portraits", "Styled sets with props and florals"],
    work: ["halle", "birthday", "glitz"],
    enquire: "Photography",
    bd: "#3D3029",
    on: "paper",
  },
  {
    slug: "brand-events",
    n: "04",
    name: "Brand & event films",
    line: ["Brands &", "events"],
    pitch:
      "Launches, shows and agency content filmed as they happen: backstage at a fashion show, a streetwear drop in kinetic type, a label's neon night.",
    outputs: ["Launch and campaign films", "Backstage and show coverage", "Behind-the-scenes content"],
    work: ["future-face-2024", "sketchbywale", "gaga-agency", "vandora"],
    enquire: "Photography and film",
    bd: "#0d0c0b",
    on: "paper",
  },
  {
    slug: "product",
    n: "05",
    name: "Product & commercial",
    line: ["Product &", "commercial"],
    pitch: "Products styled into a scene rather than cut out on white: shower gel with gold crystal heels and a mirrored tray on warm peach.",
    outputs: ["Styled product stills", "Colour-matched sets", "Images for e-commerce and social"],
    work: ["extra-pure-skin"],
    enquire: "Photography",
    bd: "#DFAE7B",
    on: "ink",
  },
];
