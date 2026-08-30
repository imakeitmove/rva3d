import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";

import "./globals.css";

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
  title: "RVA3D | 3D Visualization, Animation and Motion Design",
  description:
    "Senior-led 3D visualization, animation, and motion design for products, systems, and ideas that are hard to explain, hard to film, or need to look exceptional.",
  openGraph: {
    type: "website",
    siteName: "RVA3D",
    title: "RVA3D | 3D Visualization, Animation and Motion Design",
    description:
      "Senior-led 3D visualization, animation, and motion design for products, systems, and ideas that are hard to explain, hard to film, or need to look exceptional.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RVA3D | 3D Visualization, Animation and Motion Design",
    description:
      "Senior-led 3D visualization, animation, and motion design for products, systems, and ideas that are hard to explain, hard to film, or need to look exceptional.",
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
