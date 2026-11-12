import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://mall.custombro.org/", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://mall.custombro.org/display", changeFrequency: "monthly", priority: 0.9 },
    { url: "https://mall.custombro.org/acrylic-keyring", changeFrequency: "monthly", priority: 1 },
    { url: "https://mall.custombro.org/cosmetic-display", changeFrequency: "monthly", priority: 1 },
    { url: "https://mall.custombro.org/exhibition-display", changeFrequency: "monthly", priority: 0.9 },
  ];
}
