import { BrandCopy } from "./Brand";
import { SiteBoot } from "./SiteBoot";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Contact } from "./Contact";
export function Shell({ children, contact = true }: { children: ReactNode; contact?: boolean }) {
  return <><Header /><main id="main"><BrandCopy>{children}</BrandCopy>{contact && <Contact />}</main><SiteBoot /></>;
}
