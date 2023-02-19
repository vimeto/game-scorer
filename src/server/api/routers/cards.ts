import { z } from "zod";
import { GameNames, getContextoIdentifierFromWordleIdentifier, UserGroupRoleNames } from "../../../entities/types";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const getStreakAndGroupsCountShape = z.object({
  wordleIdentifier: z.number(),
});

export const cardsRouter = createTRPCRouter({
  getStreakAndGroupsCount: protectedProcedure
    .input(getStreakAndGroupsCountShape)
    .query(async ({ ctx, input }) => {
      const { wordleIdentifier } = input;
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const userWithTodayScoreAndGroups = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          gameScores: {
            where: {
              OR: [
                {
                  game: { name: GameNames.WORDLE },
                  identifier: {
                    gte: wordleIdentifier - 1,
                    lte: wordleIdentifier,
                  },
                },
                {
                  game: { name: GameNames.CONTEXTO },
                  identifier: {
                    gte: getContextoIdentifierFromWordleIdentifier(wordleIdentifier) - 1,
                    lte: getContextoIdentifierFromWordleIdentifier(wordleIdentifier),
                  },
                }
              ],
            },
            orderBy: { identifier: "desc" },
          },
          _count: {
            select: {
              userGroupRoles: {
                where: {
                  name: {
                    in: [UserGroupRoleNames.ADMIN, UserGroupRoleNames.MEMBER],
                  }
                }
              },
            },
          }
        },
      });
      if (!userWithTodayScoreAndGroups) throw new Error("User not found");

      const { gameScores, _count } = userWithTodayScoreAndGroups;
      const streak = (gameScores.length > 0 && gameScores[0]) ? gameScores[0].streak : 0;
      const userGroups = _count.userGroupRoles;

      return { streak, userGroups };
    }),
});
