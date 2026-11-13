import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** The site mark: a bone K on ink with the red REC dot, used for the tab icon and home-screen icon. */
export async function mark(size: number, radius: number) {
  const font = await readFile(join(process.cwd(), "assets", "BigShouldersDisplay-820.ttf"));
  const dot = Math.round(size * 0.17);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0c0b",
          borderRadius: radius,
          position: "relative",
        }}
      >
        <div style={{ fontFamily: "Display", fontSize: size * 0.95, lineHeight: 1, color: "#efeae0", marginTop: size * 0.06, marginLeft: -size * 0.14 }}>K</div>
        <div
          style={{
            position: "absolute",
            top: size * 0.1,
            right: size * 0.1,
            width: dot,
            height: dot,
            borderRadius: dot,
            background: "#ff3d1f",
          }}
        />
      </div>
    ),
    { width: size, height: size, fonts: [{ name: "Display", data: font, weight: 800, style: "normal" }] },
  );
}
