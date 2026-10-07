// COMPLETE SITE CANDIDATE
export { InteractivePage as default } from "@/components/site/InteractivePage";

export const dynamic = "force-dynamic";
// Previous metadata exported only this title/description and inherited Home social copy.
const pageCopy = {
  title: "Interactive | RVA3D",
  description: "Interactive 3D and browser-based product experiences from RVA3D.",
};
export const metadata = {
  ...pageCopy,
  alternates: { canonical: "/interactive" },
  openGraph: { ...pageCopy, type: "website", siteName: "RVA3D" },
  twitter: { ...pageCopy, card: "summary_large_image" },
};
