import type { ReactNode } from "react";
import { BrandCopy } from "./Brand";
import { SiteBoot } from "./SiteBoot";
import styles from "./PermissionReviewShell.module.css";
export function PermissionReviewShell({ children }: { children: ReactNode }) {
  return <><header className={styles.header}><span>RVA3D · Private review</span><form action="/review/logout" method="post"><button type="submit">Sign out</button></form></header>
    <main id="main"><aside className={styles.notice}>This is a private review copy and is not part of the public RVA3D site. It includes additional process material for clearance before publication.</aside><BrandCopy>{children}</BrandCopy></main><SiteBoot /></>;
}
