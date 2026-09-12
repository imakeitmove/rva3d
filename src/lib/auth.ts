import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions, DefaultSession } from "next-auth";
// Replaced because the stock provider loads Nodemailer even with a custom sender.
// import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import type { Adapter, AdapterUser } from "next-auth/adapters";

const prisma = new PrismaClient();
// Previously instantiated at module load:
// const resend = new Resend(process.env.RESEND_API_KEY!);
// Defer email-only configuration until a login link is actually requested so
// public pages can build without legacy portal credentials.
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Portal email configuration is missing: RESEND_API_KEY");
  }

  return new Resend(apiKey);
}

type PortalAdapterUser = AdapterUser & {
  portalUserId?: string | null;
  clientId?: string | null; // optional if you still have this in DB
};

export type PortalSessionUser = DefaultSession["user"] & {
  id?: string;
  portalUserId?: string | null;
};

type PortalVerificationRequest = {
  identifier: string;
  url: string;
  provider: {
    from?: string;
  };
};

const portalEmailFrom =
  process.env.EMAIL_FROM ?? "NextAuth <no-reply@example.com>";

// This mirrors NextAuth's email-provider shape, but the delivery implementation
// is Resend-only. The placeholder server value satisfies NextAuth's provider
// contract and is never used by this custom sendVerificationRequest callback.
const resendEmailProvider = {
  id: "email",
  type: "email",
  name: "Email",
  server: {},
  from: portalEmailFrom,
  maxAge: 10 * 60,
  async sendVerificationRequest({
    identifier,
    url,
    provider,
  }: PortalVerificationRequest) {
    const resend = getResendClient();
    await resend.emails.send({
      from: provider.from ?? portalEmailFrom,
      to: identifier,
      subject: "Your RVA3D login link",
      html: `
        <p>Hi!</p>
        <p>Click the link below to sign in to your RVA3D client portal:</p>
        <p><a href="${url}">${url}</a></p>
        <p>This link will expire soon. If you didn't request it, you can safely ignore this email.</p>
      `,
    });
  },
  options: {},
} as unknown as NextAuthOptions["providers"][number];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    resendEmailProvider,
    // Replaced with resendEmailProvider above so the portal no longer bundles
    // Nodemailer just to reach this same custom Resend callback.
    // EmailProvider({
    //   from: process.env.EMAIL_FROM,
    //   maxAge: 10 * 60, // 10 minutes
    //   async sendVerificationRequest({ identifier, url, provider }) {
    //     const resend = getResendClient();
    //     await resend.emails.send({
    //       from: provider.from ?? process.env.EMAIL_FROM!,
    //       to: identifier,
    //       subject: "Your RVA3D login link",
    //       html: `...`,
    //     });
    //   },
    // }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      const u = user as PortalAdapterUser;

      if (session.user) {
        const sessionUser = session.user as PortalSessionUser;

        sessionUser.id = u.id;
        // pull from portalUserId (or clientId fallback if that still exists in your DB)
        sessionUser.portalUserId = u.portalUserId ?? u.clientId ?? null;
        session.user = sessionUser;
      }

      return session;
    },

    // (leave your other callbacks as they were)
  }
};
