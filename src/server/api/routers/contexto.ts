import { z } from "zod";
import { parseInput, updateContextoStreaksWithDelay } from "../../../entities/contextoHelper";
import { GameNames } from "../../../entities/types";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const getShape = z.object({
  identifier: z.number(),
});

const updateScore = z.object({
  data: z.string(),
  comment: z.string().optional(),
});

export const contextoRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getShape)
    .query(async ({ ctx, input }) => {
      const { identifier } = input;
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const contextoScore = await prisma.gameScore.findFirst({
        where: {
          userId,
          game: { name: GameNames.CONTEXTO },
          identifier,
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

      const parsedContextoData = contextoShape.safeParse({
        id: contextoScore.identifier,
        score: contextoScore.score,
        scores: contextoScore.data,
        comment: contextoScore.comment,
      });

      if (!parsedContextoData.success) {
        throw new Error("Unable to parse data");
      }

      return { data: parsedContextoData.data };
  }),
  update: protectedProcedure
    .input(updateScore)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const { data, error } = parseInput(input.data);

      if (error.length > 0) throw new Error(error);
      if (!data) throw new Error("Unable to parse input");

      // const beginningOfYesterday = new Date();
      // beginningOfYesterday.setDate(beginningOfYesterday.getDate() - 1);
      // beginningOfYesterday.setHours(0, 0, 0, 0);
      // const endOfYesterday = new Date();
      // endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      // endOfYesterday.setHours(23, 59, 59, 999);

      try {
        const yesterdayScore = await prisma.gameScore.findFirst({
          where: {
            userId,
            game: { name: GameNames.CONTEXTO },
            identifier: data.id - 1,
          },
        });

        await prisma.gameScore.create({
          data: {
            user: {
              connect: { id: userId },
            },
            game: {
              connect: { name: GameNames.CONTEXTO },
            },
            score: data.score,
            data: data.scores,
            comment: input.comment,
            identifier: data.id,
            streak: yesterdayScore ? yesterdayScore.streak + 1 : 1,
          }
        });

        updateContextoStreaksWithDelay(prisma, userId, data.id).catch(e => console.error(e));

        return { data: { ...data, comment: input.comment } };
      } catch (e) {
        throw new Error("Unable to save score");
      }
    }),
});
