import { ReactNode } from "react";

export default function ThreeLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      {children}
    </div>
  );
}
