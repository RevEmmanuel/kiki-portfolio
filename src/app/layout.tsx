import type { Metadata, Viewport } from "next";
import "@fontsource-variable/big-shoulders-display";
import "@fontsource-variable/big-shoulders-text";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "./globals.css";
import { BackdropObserver } from "@/components/Backdrop";
import { Chrome } from "@/components/Chrome";
import { Footer } from "@/components/Closing";
import { Cursor } from "@/components/Cursor";
import { Intro } from "@/components/Intro";
import { MediaProvider } from "@/components/Media";
import { identity } from "@/content/projects";
import { allowIndexing, siteUrl } from "@/lib/site";

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#kiki`,
  url: siteUrl,
  name: identity.name,
  jobTitle: identity.title,
  email: identity.email.href,
  telephone: "+2348183783922",
  sameAs: [identity.instagram.href],
};

const description = "Photographs and films by Kiki Williams, videographer, photographer and creator: fashion, beauty, brand and culture.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Kiki Williams — Videographer / Photographer / Creator", template: "%s — Kiki Williams" },
  description,
  applicationName: "Kiki Williams",
  authors: [{ name: identity.name, url: siteUrl }],
  creator: identity.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Kiki Williams", locale: "en_NG", title: "Kiki Williams — Videographer / Photographer / Creator", description, url: "/" },
  twitter: { card: "summary_large_image" },
  // previews stay out of search until launch is confirmed
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0c0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("kw-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("kw-seen")}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`.kw-intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <MediaProvider>
          <Chrome />
          <main id="main">{children}</main>
          <Footer />
          <BackdropObserver />
          <Cursor />
          <Intro />
        </MediaProvider>
      </body>
    </html>
  );
}
