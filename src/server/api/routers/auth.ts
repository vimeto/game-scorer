import { signIn } from "next-auth/react";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../db";

import { createTRPCRouter, publicProcedure } from "../trpc";

const signUpZodShape = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  username: z.string(),
  password: z.string(),
  passwordConfirmation: z.string(),
});

// const loginZodShape = z.object({
//   email: z.string(),
//   password: z.string(),
// });

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpZodShape)
    .mutation(async ({ input }) => {
      if (input.password !== input.passwordConfirmation) {
        throw new Error("Passwords do not match");
      }

      // check if user with email or username already exists
      const conflictingUser = await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: input.email,
            },
            {
              username: input.username,
            },
          ],
        },
      });

      if (conflictingUser) {
        throw new Error("User with those credentials already exists");
      }

      const passwordDigest = await bcryptjs.hash(input.password, 10);

      // create user
      const user = await prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          username: input.username,
          passwordDigest
        },
      });

      if (!user) throw new Error("Could not create user");

      const emailHash = jwt.sign(
        { id: user.id },
        (String(user.email) || "") + (String(process.env.EMAIL_SECRET) || ""), {
        expiresIn: "1d",
      });

      console.log(emailHash);

      console.log(user);

      return {
        message: `User ${input.username} created`,
      }
    }),
  // login: publicProcedure
  //   .input(loginZodShape)
  //   .mutation(async ({ input }) => {
  //     const response = await signIn("credentials", {
  //       email: input.email,
  //       password: input.password,
  //       redirect: false,
  //     });

  //     if (!response || response.status !== 200) {
  //       throw new Error("Invalid credentials");
  //     }

  //     return {
  //       message: `Logging in user ${input.email}...`,
  //     };
  //   }),
});
