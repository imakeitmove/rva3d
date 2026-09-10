import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

type SandboxLayoutProps = {
  children: React.ReactNode;
};

export default function SandboxLayout({ children }: SandboxLayoutProps) {
  // Sandbox scenes are development tools and must not ship as public pages.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return children;
}
