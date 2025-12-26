import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seoMetadata";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = buildPageMetadata({
  title: "Login | RVA3D Client Portal",
  description: "Request a magic link to access the RVA3D client portal.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginForm />;
}
