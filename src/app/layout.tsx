import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";

import "./globals.css";
// Complete-site styles load once through /site-assets/complete-site.css below.

const geistSans = localFont({
  src: "../../public/fonts/Geist/Geist-VariableFont_wght.ttf",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../../public/fonts/Geist_Mono/GeistMono-VariableFont_wght.ttf",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rva3d.com"),
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
  title: "RVA3D | 3D Visualization, Animation and Motion Design",
  description:
    "Senior-led 3D visualization and animation, motion design, VFX, and interactive media that add depth, movement, and visual possibility to products, campaigns, and ideas.",
  openGraph: {
    type: "website",
    siteName: "RVA3D",
    title: "RVA3D | 3D Visualization, Animation and Motion Design",
    description:
      "Senior-led 3D visualization and animation, motion design, VFX, and interactive media that add depth, movement, and visual possibility to products, campaigns, and ideas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RVA3D | 3D Visualization, Animation and Motion Design",
    description:
      "Senior-led 3D visualization and animation, motion design, VFX, and interactive media that add depth, movement, and visual possibility to products, campaigns, and ideas.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RVA3D",
  url: "https://www.rva3d.com",
  email: "hello@rva3d.com",
  telephone: "+1-804-392-8183",
  foundingDate: "2026",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Richmond",
    addressRegion: "VA",
    addressCountry: "US",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>{["composition", "v003", "v004", "v005", "v006", "v007", "v008", "complete-site"].map(name => <link key={name} rel="stylesheet" href={`/site-assets/${name}.css`} />)}</head>
      <body className={`${geistSans.variable} ${geistMono.variable} v003 v004 v005 v006 v007 v008 complete-site`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
