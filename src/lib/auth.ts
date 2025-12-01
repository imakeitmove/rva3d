import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

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
    async redirect({ url, baseUrl }) {
      // After login, always send user to /portal
      return baseUrl + "/portal";
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).portalUserId = user.portalUserId;
      }
      return session;
    },
  },
};
