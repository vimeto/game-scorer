import { UserGroupRoleNames } from "../../../entities/types";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const cardsRouter = createTRPCRouter({
  getStreakAndGroupsCount: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const beginningOfYesterday = new Date();
      beginningOfYesterday.setDate(beginningOfYesterday.getDate() - 1);
      beginningOfYesterday.setHours(0, 0, 0, 0);
      const beginningOfToday = new Date();
      beginningOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const userWithTodayScoreAndGroups = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          gameScores: {
            where: {
              date: {
                gte: beginningOfYesterday,
                lte: endOfToday,
              },
            },
            orderBy: { createdAt: "desc" },
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
      let streak = 0;

      // TODO: simplify this, this is a mess
      if (gameScores.length > 0 && gameScores[0] && (
          (gameScores[0].date.getTime() > beginningOfYesterday.getTime() && gameScores[0].date.getTime() < beginningOfToday.getTime()) ||
          (gameScores[0].date.getTime() > beginningOfToday.getTime() && gameScores[0].date.getTime() < endOfToday.getTime())
        )) {
        streak = gameScores[0].streak;
      }

      const userGroups = _count.userGroupRoles;

      return { streak, userGroups };
    }),
});
