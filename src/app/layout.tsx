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
  metadataBase: new URL("https://rva3d.com"),
  title: "RVA3D — 3D Visualization, Animation & Motion Design",
  description:
    "Senior-led 3D visualization, animation, and motion design for products, systems, and ideas that are hard to explain, hard to film, or need to look exceptional.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "RVA3D",
    title: "RVA3D — 3D Visualization, Animation & Motion Design",
    description:
      "Senior-led 3D visualization, animation, and motion design for products, systems, and ideas that are hard to explain, hard to film, or need to look exceptional.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
