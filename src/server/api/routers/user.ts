import { z } from "zod";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { sendEmailRegistration } from "../../../entities/mailer";

const signUpShape = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  username: z.string(),
  password: z.string(),
  passwordConfirmation: z.string(),
});

// TODO: prob dont need id as it is in session
const meShape = z.object({
  id: z.string().min(1),
});

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(signUpShape)
    .mutation(async ({ input }) => {
      if (input.password !== input.passwordConfirmation) {
        // TODO: update error message to i18n key
        throw new Error("Passwords do not match");
      }

      // check if user with email or username already exists
      const conflictingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: input.email },
            { username: input.username },
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

      if (!user?.email) throw new Error("Could not create user");

      const emailHash = jwt.sign(
        { id: user.id },
        (String(user.email) || "") + (String(process.env.EMAIL_SECRET) || ""), {
        expiresIn: "1d",
      });

      // update user so that we can query by emailHash
      await prisma.user.update({
        where: { id: user.id },
        data: { emailHash },
      })

      // send email
      const to = user.email;
      const token = emailHash;
      await sendEmailRegistration(to, token);

      // TODO: update the created message
      return {
        message: `User ${input.username} created`,
      }
    }),
    me: protectedProcedure
      .input(meShape)
      .query(async ({ input }) => {
        const user = await prisma.user.findUnique({
          where: {
            id: input.id,
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // const profilePictureBackgroundColor = `hsl(${Math.round((360 * Math.random()))}, ${(25 + 70 * Math.random()).toFixed(2)}%, ${(85 + 10 * Math.random()).toFixed(2)}%)`;

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          bgColor: user.bgColor ?? "#ff0000",
        };
      }),
});
