import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { RouteSceneSync } from "@/components/RouteSceneSync";
import { SiteNav } from "@/components/ui/SiteNav";
import { FlatToggle } from "@/components/ui/FlatToggle";
import { MarketingCanvas } from "@/components/three/MarketingCanvas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RVA3D",
  description: "Interactive 3D portfolio and client portal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ margin: 0, padding: 0, overflow: "hidden", position: "relative" }}>
        <MarketingCanvas />
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
          <RouteSceneSync />
          <SiteNav />
          <div
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 6,
              display: "flex",
              gap: 8,
            }}
          >
            <FlatToggle />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
