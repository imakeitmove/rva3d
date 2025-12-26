import { siteUrl } from "./seoMetadata";

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "RVA3D",
    url: siteUrl,
    areaServed: [
      {
        "@type": "City",
        name: "Richmond",
        addressRegion: "VA",
      },
      {
        "@type": "State",
        name: "Virginia",
      },
    ],
    description:
      "RVA3D delivers 3D animation, interactive web experiences, and product visualization from Richmond, VA.",
    serviceType: [
      "3D animation",
      "Interactive web experiences",
      "Product visualization",
    ],
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RVA3D",
    url: siteUrl,
  };
}
