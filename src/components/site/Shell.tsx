import { SiteBoot } from "./SiteBoot";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Contact } from "./Contact";
export function Shell({ children, contact = true }: { children: ReactNode; contact?: boolean }) {
  return <><Header /><main id="main">{children}{contact && <Contact />}</main><SiteBoot /></>;
}
