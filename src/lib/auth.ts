import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import type { AdapterUser } from "next-auth/adapters";

type PortalAdapterUser = AdapterUser & {
  userId?: string | null;        // your Prisma User.userId (if you have it)
  portalUserId?: string | null;  // mapped from Notion portal "User ID"
  clientId?: string | null;      // legacy, if still in DB
};

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
        // Always expose the primary DB id
        (session.user as any).id = u.id;
  
        // Optional: expose userId separately if you still care about it
        (session.user as any).userId = u.userId ?? null;
  
        // This is the one your portal routes actually use:
        // /portal/[portalUserId]/...
        (session.user as any).portalUserId =
          u.portalUserId ?? u.userId ?? u.clientId ?? null;
      }
  
      return session;
    },
  
    // keep your other callbacks (jwt, signIn, etc) as they are
  }
};
