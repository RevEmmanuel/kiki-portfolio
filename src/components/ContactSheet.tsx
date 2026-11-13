"use client";

import Image from "next/image";
import { projects } from "@/content/projects";
import { useMedia } from "./Media";

/** Every photograph on one sheet, like a contact print. Any frame opens full size. */
export function ContactSheet() {
  const { openPhoto } = useMedia();
  const all = projects.flatMap((p) => p.photos.map((ph) => ({ ...ph, project: p.title })));
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
      {all.map((ph, i) => (
        <li key={ph.src}>
          <button onClick={() => openPhoto(all, i)} className="group relative block aspect-[2/3] w-full overflow-hidden" aria-label={`View ${ph.project}, photograph`}>
            <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 1024px) 14vw, 33vw" className="object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-105 group-hover:grayscale-0" />
            <span className="kicker absolute left-1.5 top-1.5 text-[10px] text-paper mix-blend-difference">{String(i + 1).padStart(2, "0")}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
