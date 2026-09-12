import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Private RVA3D Review",
  description: "Private working portfolio material shared for feedback.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function PrivateReviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
