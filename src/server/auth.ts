import type { GetServerSidePropsContext } from "next";
import { z } from "zod";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type DefaultUser,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env/server.mjs";
import { prisma } from "./db";
import bcryptjs from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
      username?: string | null;
      bgColor?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    username?: string | null;
    bgColor?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    bgColor?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt ({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.username = user.username;
        token.bgColor = user.bgColor;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.bgColor = token.bgColor;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Account email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials,) {
        const zodCredentialType = z.object({ email: z.string(), password: z.string() });
        const zodCredentials = zodCredentialType.safeParse(credentials);
        if (!zodCredentials.success) { return Promise.reject("Unable to parse input data"); }

        const { email, password } = zodCredentials.data;
        // TODO: update to only perform one query
        const possibleUser = await prisma.user.findUnique({
          where: {
            email
          }
        }) || await prisma.user.findUnique({
          where: {
            username: email
          }
        });

        if (!possibleUser) {
          // TODO: update these to i18n keys
          return Promise.reject(new Error("User with that email or username not found"));
        }
        if (possibleUser.emailVerified === null) {
          return Promise.reject(new Error("Email not verified"));
        }

        const userPasswordDigest = String(possibleUser?.passwordDigest) || "";
        const correctPassword = await bcryptjs.compare(password, userPasswordDigest);

        if (correctPassword) return possibleUser;
        return Promise.reject(new Error("Incorrect password"));
      }
    }),
  ],
  jwt: {
    secret: env.NEXTAUTH_SECRET,
  },
  adapter: PrismaAdapter(prisma),
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  }
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
