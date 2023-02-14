import { z } from "zod";
import { parseInput } from "../../../entities/contextoHelper";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const updateScore = z.object({
  data: z.string(),
  comment: z.string().optional(),
});

export const contextoRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const beginningOfToday = new Date();
      beginningOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const contextoScore = await prisma.gameScore.findFirst({
        where: {
          userId,
          game: {
            name: "Contexto",
          },
          createdAt: {
            gte: beginningOfToday,
            lte: endOfToday,
          },
        },
      });

      const contextoShape = z.object({
        id: z.number(),
        score: z.number(),
        scores: z.object({
          green: z.number().nullable(),
          yellow: z.number().nullable(),
          red: z.number().nullable(),
        }),
        comment: z.string().optional(),
      });
      if (!contextoScore) return { data: null };

      const a = contextoShape.safeParse({
        id: Number(contextoScore.identifier),
        score: contextoScore.score,
        scores: contextoScore.data,
        comment: contextoScore.comment,
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

      const beginningOfYesterday = new Date();
      beginningOfYesterday.setDate(beginningOfYesterday.getDate() - 1);
      beginningOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date();
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);

      try {
        const yesterdayScore = await prisma.gameScore.findFirst({
          where: {
            userId,
            // game: {
            //   name: "Contexto",
            // },
            date: {
              gte: beginningOfYesterday,
              lte: endOfYesterday,
            },
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
                name: "Contexto",
              },
            },
            score: data.score,
            data: data.scores,
            comment: input.comment,
            identifier: String(data.id) || "",
            date: new Date(),
            streak: yesterdayScore ? yesterdayScore.streak + 1 : 1,
          }
        });

        return { data: { ...data, comment: input.comment } };
      } catch (e) {
        throw new Error("Unable to save score");
      }
    }),
});
