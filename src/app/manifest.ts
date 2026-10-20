import type { MetadataRoute } from "next";
import { getContent } from "@/lib/server/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { site } = await getContent();
  return {
    name: site.name,
    short_name: "LAMHA",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#06070b",
    theme_color: "#06070b",
    lang: "en",
    icons: [
      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
