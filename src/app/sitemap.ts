import type { MetadataRoute } from "next";

import { getApprovedWork } from "@/content/work";

const SITE_URL = "https://www.rva3d.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const approvedWork = getApprovedWork();
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  if (approvedWork.length > 0) {
    entries.push({
      url: `${SITE_URL}/work`,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  entries.push(
    ...approvedWork.map((study) => ({
      url: `${SITE_URL}/work/${study.slug}`,
      lastModified: new Date(study.publication.approvedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  );

  return entries;
}
