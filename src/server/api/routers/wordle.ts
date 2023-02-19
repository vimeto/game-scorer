import { z } from "zod";
import { GameNames } from "../../../entities/types";
import { parseInput, updateWordleStreaksWithDelay } from "../../../entities/wordleHelper";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const getShape = z.object({
  identifier: z.number(),
});

const updateScore = z.object({
  data: z.string(),
  comment: z.string().optional(),
});

export const wordleRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getShape)
    .query(async ({ ctx, input }) => {
      const { identifier } = input;
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const wordleScore = await prisma.gameScore.findFirst({
        where: {
          userId,
          game: { name: GameNames.WORDLE },
          identifier,
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

      const parsedWordleData = wordleShape.safeParse({
        id: wordleScore.identifier,
        score: wordleScore.score,
        rows: wordleScore.data,
        comment: wordleScore.comment,
      });

      if (!parsedWordleData.success) {
        throw new Error("Unable to parse data");
      }

      return { data: parsedWordleData.data };
  }),
  update: protectedProcedure
    .input(updateScore)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const { data, error } = parseInput(input.data);
      if (error.length > 0) throw new Error(error);

      if (!data) throw new Error("Unable to parse input");

      try {
        const [previousScore, wordleGame] = await Promise.all([
          await prisma.gameScore.findFirst({
            where: {
              userId,
              game: { name: GameNames.WORDLE },
              identifier: data.id - 1,
            },
          }),
          await prisma.game.findFirst({
            where: { name: GameNames.WORDLE },
          }),
        ]);

        if (!wordleGame) throw new Error("Unable to find game");

        await prisma.gameScore.upsert({
          where: {
            userId_identifier_gameId: {
              gameId: wordleGame.id,
              userId: userId,
              identifier: data.id,
            }
          },
          update: {
            score: data.score,
            data: data.rows,
            comment: input.comment,
            identifier: data.id,
            streak: previousScore ? previousScore.streak + 1 : 1,
          },
          create: {
            user: {
              connect: { id: userId },
            },
            game: {
              connect: { name: GameNames.WORDLE },
            },
            score: data.score,
            data: data.rows,
            comment: input.comment,
            identifier: data.id,
            streak: previousScore ? previousScore.streak + 1 : 1,
          },
        });

        updateWordleStreaksWithDelay(prisma, userId, data.id).catch(e => console.error(e));

        return { data: { ...data, comment: input.comment } };
      } catch (e) {
        let errorMessage = "Unable to save score";
        if (e instanceof Error) {
          errorMessage = e.message;
        }
        else if (typeof e === "string") {
          errorMessage = e;
        }

        throw new Error(errorMessage);
      }
    }),
});
