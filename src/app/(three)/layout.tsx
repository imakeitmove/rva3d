import { ReactNode } from "react";

export default function ThreeLayout({ children }: { children: ReactNode }) {
  // Full-screen scene routes own their viewport sizing. Keeping this layout
  // neutral lets the public homepage use normal document scrolling.
  return children;
}
