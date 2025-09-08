import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user) return null;
        const ok = await compare(creds.password, user.password);
        if (!ok) return null;
        // return a minimal object (safe for JWT)
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token as any).id ?? null;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
