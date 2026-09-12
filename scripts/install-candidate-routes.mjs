import fs from "node:fs/promises";
import path from "node:path";
const write = async (file, source) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  let old = ""; try { old = await fs.readFile(file, "utf8"); } catch {}
  if (old && !old.includes("COMPLETE SITE CANDIDATE")) source += "\n/* Previous implementation retained for restoration. Replaced only in the isolated complete-site candidate.\n" + old.replaceAll("*/", "* /") + "\n*/\n";
  await fs.writeFile(file, "// COMPLETE SITE CANDIDATE\n" + source);
};
await write("src/app/(three)/page.tsx", 'import { ApprovedHome } from "@/components/site/ApprovedHome";\nexport const dynamic = "force-dynamic";\nexport default function Home() { return <ApprovedHome />; }\n');
await write("src/app/(three)/work/page.tsx", 'export { WorkIndex as default } from "@/components/site/WorkPages";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "Work | RVA3D", description: "3D animation, product visualization and motion design: selected projects and the contribution behind them." };');
await write("src/app/(three)/work/[slug]/page.tsx", 'export { CasePage as default, caseMetadata as generateMetadata } from "@/components/site/WorkPages";\nexport const dynamic = "force-dynamic";');
await write("src/app/(three)/capabilities/page.tsx", 'export { CapabilitiesPage as default } from "@/components/site/CapabilitiesPage";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "Capabilities | RVA3D", description: "Six ways to commission RVA3D: animation, visualization, motion design, VFX, interactive 3D and creative production support." };');
await write("src/app/(three)/capabilities/[slug]/page.tsx", 'export { CapabilityDetail as default } from "@/components/site/CapabilityDetail";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "VFX and Compositing | RVA3D", description: "Visible and invisible visual effects, from shot planning through final compositing." };');
await write("src/app/login/page.tsx", 'export { ClientLogin as default } from "@/components/site/StudioPages";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "Client login | RVA3D", robots: { index: false, follow: false, noarchive: true } };');
await write("src/app/(three)/about/page.tsx", 'export { AboutPage as default } from "@/components/site/StudioPages";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "About | RVA3D", description: "Meet Deven Langston, the Richmond-based creative lead behind RVA3D." };');
await write("src/app/(three)/privacy/page.tsx", 'export { PrivacyPage as default } from "@/components/site/StudioPages";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "Privacy | RVA3D" };');
await write("src/app/(three)/contact/page.tsx", 'import { redirect } from "next/navigation";\nexport default function ContactPage() { redirect("/review/site/#contact"); }');
await write("src/app/client-login/page.tsx", 'import { redirect } from "next/navigation";\nexport default function LoginAlias() { redirect("/review/site/login"); }\nexport const metadata = { robots: { index: false, noarchive: true } };');
console.log("Candidate route adapters installed; old source commented in place.");
