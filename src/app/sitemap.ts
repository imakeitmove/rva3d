import type { MetadataRoute } from "next";
import { sampleProjects } from "./work/page";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rva3d.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/services",
    "/services/3d-animation",
    "/services/interactive-web-experiences",
    "/services/product-visualization",
    "/work",
    "/sandbox",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route === "" ? "/" : route}`,
    lastModified: new Date(),
  }));

  const workRoutes: MetadataRoute.Sitemap = sampleProjects.map((project) => ({
    url: `${baseUrl}/work/${project.slug}`,
    lastModified: new Date(),
  }));

  // TODO: When Notion-backed case studies become dynamic, extend this list with real slugs.

  return [...staticRoutes, ...workRoutes];
}
