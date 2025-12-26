import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rva3d.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/services", "/work", "/sandbox", "/contact"],
      disallow: ["/portal", "/portal/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
