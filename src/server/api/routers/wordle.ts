import { z } from "zod";
import { parseInput } from "../../../entities/wordleHelper";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const updateScore = z.object({
  data: z.string(),
  comment: z.string().optional(),
});

export const wordleRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const beginningOfToday = new Date();
      beginningOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const wordleScore = await prisma.gameScore.findFirst({
        where: {
          userId,
          game: {
            name: "Wordle",
          },
          createdAt: {
            gte: beginningOfToday,
            lte: endOfToday,
          },
        },
      });

      const wordleShape = z.object({
        id: z.number(),
        score: z.number(),
        rows: z.array(z.array(z.number())),
        comment: z.string().optional(),
      });

      if (!wordleScore) {
        return { data: null };
      }

      console.log(wordleScore);

      const a = wordleShape.safeParse({
        id: Number(wordleScore.identifier),
        score: wordleScore.score,
        rows: wordleScore.data,
        comment: wordleScore.comment,
      });

      if (!a.success) {
        throw new Error("Unable to parse data");
      }

      return { data: a.data };
  }),
  update: protectedProcedure
    .input(updateScore)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const { data, error } = parseInput(input.data);

      if (error.length > 0) throw new Error(error);
      if (!data) throw new Error("Unable to parse input");

      const yesterdayStartOfDay = new Date();
      yesterdayStartOfDay.setDate(yesterdayStartOfDay.getDate() - 1);
      yesterdayStartOfDay.setHours(0, 0, 0, 0);
      const yesterdayEndOfDay = new Date();
      yesterdayEndOfDay.setDate(yesterdayEndOfDay.getDate() - 1);
      yesterdayEndOfDay.setHours(23, 59, 59, 999);

      try {
        const yesterdayScore = await prisma.gameScore.findFirst({
          where: {
            userId,
            game: {
              name: "Wordle",
            },
            date: {
              gte: yesterdayStartOfDay,
              lte: yesterdayEndOfDay,
            }
          },
        });

        await prisma.gameScore.create({
          data: {
            user: {
              connect: {
                id: userId,
              }
            },
            game: {
              connect: {
                name: "Wordle",
              },
            },
            score: data.score,
            data: data.rows,
            comment: input.comment,
            identifier: String(data.id) || "",
            date: new Date(),
            streak: yesterdayScore ? yesterdayScore.streak + 1 : 1,
          }
        });

        return { data: { ...data, comment: input.comment } };
      } catch (e) {
        const errorMessage = (e instanceof Error) ? e.message : "";
        throw new Error("Unable to save score. Details: " + errorMessage);
      }
    }),
});
