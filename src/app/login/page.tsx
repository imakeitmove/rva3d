// COMPLETE SITE CANDIDATE
export { default } from "@/components/site/ClientLogin";
export const dynamic = "force-dynamic";
export const metadata = { title: "Client login | RVA3D", robots: { index: false, follow: false, noarchive: true } };
/* Previous implementation retained for restoration. Replaced only in the isolated complete-site candidate.
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await signIn("email", { email, redirect: false });
    setSent(true);
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Client Login</h1>
      {!sent ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 10,
              width: "100%",
              maxWidth: 320,
              marginBottom: 10,
            }}
            required
          />
          <button
            type="submit"
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            Send login link
          </button>
        </form>
      ) : (
        <p>Check your email for a magic login link.</p>
      )}
    </main>
  );
}

*/
