import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const font = (f: string) => readFile(join(process.cwd(), "assets", f));

async function dataUri(publicPath: string) {
  const buf = await readFile(join(process.cwd(), "public", publicPath));
  const type = publicPath.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${type};base64,${buf.toString("base64")}`;
}

/** Share card in the Backdrop language: one colour field, one real frame, the title set large. */
export async function ogCard({
  title,
  kicker,
  bd,
  on,
  image,
  ratio = 4 / 5,
  brand = true,
}: {
  title: string;
  kicker: string;
  bd: string;
  on: "ink" | "paper";
  image?: string | null;
  ratio?: number;
  brand?: boolean;
}) {
  const [display, text] = await Promise.all([font("BigShouldersDisplay-820.ttf"), font("BigShouldersText-600.ttf")]);
  const color = on === "ink" ? "#0d0c0b" : "#f3efe7";
  const src = image ? await dataUri(image) : null;
  const imgH = 630 - 80;
  const imgW = Math.round(imgH * Math.min(ratio, 1.2));
  const size = Math.min(150, Math.floor((1200 - imgW - 160) / (title.length * 0.46)));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: bd, color, padding: 40 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 40 }}>
          <div style={{ fontFamily: "Text", fontSize: 28, letterSpacing: 1, textTransform: "uppercase" }}>{brand ? "Kiki Williams" : ""}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Display", fontSize: size, lineHeight: 0.9, textTransform: "uppercase" }}>{title}</div>
            <div style={{ fontFamily: "Text", fontSize: 28, marginTop: 20, opacity: 0.85 }}>{kicker}</div>
          </div>
        </div>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} width={imgW} height={imgH} style={{ objectFit: "cover" }} alt="" />
        )}
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Display", data: display, weight: 800, style: "normal" },
        { name: "Text", data: text, weight: 600, style: "normal" },
      ],
    },
  );
}
