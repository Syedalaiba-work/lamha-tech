import { ImageResponse } from "next/og";
import { site } from "@/data/site";
import { getContent } from "@/lib/server/content";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const { site: live } = await getContent();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #050b18 0%, #0b1b3a 100%)",
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M4 3h7v14.5l3.5 3.5H28v7H4z" fill="#ffffff" />
            <path d="M20.5 5.5l4.5 4.5-4.5 4.5L16 10z" fill="#1769E0" />
            <path d="M27.5 2.5l2.5 2.5-2.5 2.5L25 5z" fill="#2E7CF6" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 8 }}>LAMHA</div>
            <div style={{ fontSize: 13, letterSpacing: 4, color: "#97a3b6" }}>TECHNOLOGIES · ISLAMABAD, PAKISTAN</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2, display: "flex", flexDirection: "column" }}>
            <span>Technology That Turns</span>
            <span>
              Problems Into <span style={{ color: "#2E7CF6" }}>Progress.</span>
            </span>
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#c3ccda" }}>{live.supportingLine}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#6b7891" }}>
          <span>Software · Engineering · Digital Products</span>
          <span>Start a Project</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
