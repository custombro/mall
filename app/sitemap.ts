import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://mall.custombro.org/", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://mall.custombro.org/display", changeFrequency: "monthly", priority: 1 },
  ];
}
