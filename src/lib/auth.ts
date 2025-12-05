import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import type { Adapter, AdapterUser } from "next-auth/adapters";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

type PortalAdapterUser = AdapterUser & {
  portalUserId?: string | null;
  clientId?: string | null; // optional if you still have this in DB
};

type SessionUser = DefaultSession["user"] & {
  id?: string;
  portalUserId?: string | null;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // 10 minutes
      async sendVerificationRequest({ identifier, url, provider }) {
        await resend.emails.send({
          from: provider.from ?? process.env.EMAIL_FROM!,
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
    }),
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
        const sessionUser = session.user as SessionUser;

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
