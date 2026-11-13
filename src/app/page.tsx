import { BookBand } from "@/components/Closing";
import { Hero } from "@/components/home/Hero";
import { Selected, ServicesTeaser, Statement } from "@/components/home/Sections";
import { Marquee } from "@/components/Marquee";
import { Reel } from "@/components/Reel";

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <Selected />
      <ServicesTeaser />
      <Marquee words={["Photography", "Film", "Fashion", "Beauty", "Portrait", "Brand", "Events"]} />
      <Reel limit={14} />
      <BookBand />
    </>
  );
}
