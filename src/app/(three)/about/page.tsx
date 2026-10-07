// COMPLETE SITE CANDIDATE
// Previous complete-site composition retained: export { AboutPage as default } from "@/components/site/StudioPages";
// September 30 About composition retained for restoration:
// export { AboutEditorial as default } from "@/components/site/AboutEditorial";
import type { Metadata } from "next";
import { aboutDescription } from "@/content/site/about_team";
import { AboutTeamPage } from "@/components/site/AboutTeam";

export default function AboutPage() { return <AboutTeamPage />; }
export const dynamic = "force-dynamic";
// Previous description: Work directly with Deven Langston, RVA3D’s founder and creative lead, with 20 years of experience in animation, motion design and 3D production.
export const metadata: Metadata = {
  title: "About | RVA3D",
  description: aboutDescription,
  alternates: { canonical: "https://www.rva3d.com/about" },
  openGraph: { title: "About | RVA3D", description: aboutDescription, url: "https://www.rva3d.com/about", type: "website", siteName: "RVA3D" },
  twitter: { card: "summary_large_image", title: "About | RVA3D", description: aboutDescription },
};

// Copy audit 2026-09-16: replaced passages retained for editorial rollback.
// Meet Deven Langston, the Richmond-based creative lead behind RVA3D.
