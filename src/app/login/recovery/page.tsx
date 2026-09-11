import { ClientAccess } from "@/components/site/ClientLogin";
export const dynamic = "force-dynamic";
export const metadata = { title: "Recover client access | RVA3D", robots: { index: false, follow: false, noarchive: true } };
export default function RecoveryPage() { return <ClientAccess recovery />; }
