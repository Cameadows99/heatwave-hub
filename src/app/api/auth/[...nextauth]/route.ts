import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import your Prisma adapter + prisma client
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ...your login check here, return user or null
        // must return an object that includes id & role fields in the DB
      },
    }),
  ],
  session: { strategy: "database" }, // or "jwt" if you prefer, both work
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        session.user.role = (user as any).role; // e.g. "ADMIN" | "MANAGER" | "EMPLOYEE"
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
