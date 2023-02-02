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
import { User } from "@prisma/client";
import jwt from "next-auth/jwt";

const parseCookie = (str: string) => (
  str
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      if (!v[0] || !v[1]) return acc;
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {} as Record<string, string>));

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    emailVerified?: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt ({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.emailVerified = user.emailVerified;
      }
      return session;
    },
  },
  providers: [
    // Create another credentials provider for refreshing the JWT
    CredentialsProvider({
      id: 'refresh-user',
      name: 'refresh-user',
      credentials: {},
      async authorize(_credentials, req) {
        const cookies = (req.headers as Record<string, string>)?.cookie || "";
        const parsedCookies = parseCookie(cookies);
        const token = parsedCookies["next-auth.session-token"];
        // can also be 'cookies['__Secure-next-auth.session-token']'

        console.log("token", token);
        const secret = String(env.NEXTAUTH_SECRET) || "";
        console.log("secret", secret);

        if (!token) return null;
        const decodedToken = await jwt.decode({ token, secret: String(env.NEXTAUTH_SECRET) || "" });

        console.log("decodedToken, 😊", decodedToken);

        if (!decodedToken?.id) return null;

        const user = await prisma.user.findUnique({
          where: {
            id: decodedToken.id
          }
        });

        if (user) return user;
        return null;
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Account email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials,) {
        const zodCredentialType = z.object({ email: z.string(), password: z.string() });
        const zodCredentials = zodCredentialType.safeParse(credentials);
        if (!zodCredentials.success) { return null; }

        const { email, password } = zodCredentials.data;
        const possibleUser = await prisma.user.findUnique({
          where: {
            email
          }
        }) || await prisma.user.findUnique({
          where: {
            username: email
          }
        });
        if (!possibleUser) { return null; }

        const userPasswordDigest = String(possibleUser?.passwordDigest) || "";
        const correctPassword = await bcryptjs.compare(password, userPasswordDigest);

        if (correctPassword) return possibleUser;
        else return null;
      }
    }),

  ],
  jwt: {
    secret: env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
