import type { Metadata } from "next";
import { FaqEditorial } from "@/components/site/FaqEditorial";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "FAQ | RVA3D", description: "Practical answers about working with RVA3D, from project scope and collaboration to reviews and delivery.", alternates: { canonical: "https://www.rva3d.com/faq" } };
export default function FaqPage() { return <FaqEditorial />; }
