import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma/client";
import { env } from "@/lib/config/env";
import { loginSchema } from "@/lib/auth/schemas";
import { verifyPassword } from "@/lib/auth/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: env.authSecret,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsedCredentials.data.email,
          },
        });

        if (!user?.passwordHash || !user.isActive) {
          return null;
        }

        const passwordMatches = await verifyPassword(
          parsedCredentials.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "FAN";
      }

      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = token.role === "CREATOR" || token.role === "ADMIN" ? token.role : "FAN";
      }

      return session;
    },
  },
});
