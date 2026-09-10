import type { MetadataRoute } from "next";

import { getPublishedCapabilityPages } from "@/content/capabilities";
import { getApprovedWork } from "@/content/work";

const SITE_URL = "https://www.rva3d.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const approvedWork = getApprovedWork();
  const publishedCapabilities = getPublishedCapabilityPages();
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/capabilities`,
      changeFrequency: "monthly",
      priority: 0.9,
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
    ...publishedCapabilities.map((capability) => ({
      url: `${SITE_URL}/capabilities/${capability.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...approvedWork.map((study) => ({
      url: `${SITE_URL}/work/${study.slug}`,
      lastModified: new Date(study.publication.approvedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  );

  return entries;
}
