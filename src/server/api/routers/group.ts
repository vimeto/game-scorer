import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { JSONValue } from "superjson/dist/types";
import { z } from "zod";
import { GroupResultType, type GroupedUserGroupScoreValueTypes } from "../../../entities/types";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

type UserGroupQueryType = {
  gameName: string;
  userGroupId: string;
  userGroupName: string;
  username: string;
  score: number;
}

const getGroupShape = z.object({
  id: z.string(),
});

const getWeekResultsShape = z.object({
  id: z.string(),
  fromDate: z.date(),
  toDate: z.date(),
})

// "21.11.2023": { wordle: { score: string; comment?: string; data: JSON }, contexto: { score: string; comment?: string; data?: JSON } }

export const groupRouter = createTRPCRouter({
  getTodayIndexSelection: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      // const beginningOfYesterday = new Date();
      // beginningOfYesterday.setDate(beginningOfYesterday.getDate() - 1);
      // beginningOfYesterday.setHours(0, 0, 0, 0);
      const beginningOfToday = new Date();
      // beginningOfToday.setDate(beginningOfToday.getDate() - 4);
      beginningOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      // endOfToday.setDate(endOfToday.getDate() - 4);
      endOfToday.setHours(23, 59, 59, 999);

      const result = await prisma.$queryRaw<UserGroupQueryType[]>`
        SELECT Game.name AS gameName, UserGroup.id AS userGroupId, UserGroup.name AS userGroupName, u1.username AS username, MIN(GameScore.score) AS score
        FROM UserGroup
        JOIN _UserToUserGroup utug1 ON utug1.B = UserGroup.id
        JOIN User u1 ON utug1.A = u1.id
        JOIN _UserToUserGroup utug2 ON utug2.B = UserGroup.id
        JOIN User u2 ON utug2.A = u2.id
        JOIN GameScore ON GameScore.userId = u1.id
        JOIN Game ON GameScore.gameId = Game.id
        WHERE Game.name IN ('Contexto', 'Wordle') AND u2.id = ${userId} AND GameScore.date >= ${beginningOfToday} AND GameScore.date <= ${endOfToday}
        GROUP BY Game.name, UserGroup.id, u1.id
        ORDER BY MIN(GameScore.score) ASC;
      `;

      const resultsByUserGroup = result.reduce((acc, cur) => {
        const { userGroupId, userGroupName, gameName, username, score } = cur;

        acc[userGroupId] = acc[userGroupId] || { id: userGroupId, name: userGroupName, wordleWinner: null, contextoWinner: null };

        if (gameName === 'Wordle') {
          const currentWinner = (acc[userGroupId] as GroupedUserGroupScoreValueTypes).wordleWinner;
          if (!currentWinner || currentWinner.score > score) {
            (acc[userGroupId] as GroupedUserGroupScoreValueTypes).wordleWinner = { username, score };
          }
        } else if (gameName === 'Contexto') {
          const currentWinner = (acc[userGroupId] as GroupedUserGroupScoreValueTypes).contextoWinner;
          if (!currentWinner || currentWinner.score > score) {
            (acc[userGroupId] as GroupedUserGroupScoreValueTypes).contextoWinner = { username, score };
          }
        }
        return acc;
      }, {} as Record<string, GroupedUserGroupScoreValueTypes>);

      const userUserGroups = await prisma.userGroup.findMany({
        where: {
          members: { some: { id: userId } },
        },
      });

      userUserGroups.forEach((userUserGroup) => {
        if (!resultsByUserGroup[userUserGroup.id]) {
          resultsByUserGroup[userUserGroup.id] = {
            id: userUserGroup.id,
            name: userUserGroup.name,
            wordleWinner: null,
            contextoWinner: null,
          };
        }
      });

      return { resultsByUserGroup };
    }),
    me: protectedProcedure
      .input(getGroupShape)
      .query(async ({ input }) => {
        const group = await prisma.userGroup.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            name: true,
            members: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                bgColor: true,
              }
            }
          }
        });

        // const group = {
        //   id: '1',
        //   name: 'Vilhelm & Viivi',
        //   members: [
        //     {
        //       id: '1',
        //       username: 'vimetoivonen',
        //       firstName: 'Vilhelm',
        //       lastName: 'Toivonen',
        //       bgPictureColor: "#ff0000",
        //       role: "admin",
        //       streak: 3
        //     },
        //     {
        //       id: '2',
        //       username: 'itsviivi',
        //       firstName: 'Viivi',
        //       lastName: 'Alitalo',
        //       bgPictureColor: "#00ff00",
        //       role: "member",
        //       streak: 1
        //     },
        //     {
        //       id: '3',
        //       username: 'itsviivi',
        //       firstName: 'Viivi',
        //       lastName: 'Alitalo',
        //       bgPictureColor: "#00ff00",
        //       role: "member",
        //       streak: 1
        //     },
        //     {
        //       id: '4',
        //       username: 'itsviivi',
        //       firstName: 'Viivi',
        //       lastName: 'Alitalo',
        //       bgPictureColor: "#00ff00",
        //       role: "member",
        //       streak: 1
        //     },
        //     {
        //       id: '5',
        //       username: 'itsviivi',
        //       firstName: 'Viivi',
        //       lastName: 'Alitalo',
        //       bgPictureColor: "#00ff00",
        //       role: "member",
        //       streak: 1
        //     },
        //     {
        //       id: '6',
        //       username: 'itsviivi',
        //       firstName: 'Viivi',
        //       lastName: 'Alitalo',
        //       bgPictureColor: "#00ff00",
        //       role: "member",
        //       streak: 1
        //     },
        //   ],
        // }

        if (!group) {
          // TODO: test that this error is shown to user
          throw new Error("Group not found");
        }

        return { group };
      }),
      weekResults: protectedProcedure
      .input(getWeekResultsShape)
      .query(async ({ input, ctx }) => {
        const userId = ctx.session.user.id;
        const { fromDate, toDate, id } = input;
        if (!userId) throw new Error("User not found");

        const memberIds = await prisma.userGroup.findUnique({
          where: {
            id,
          },
          select: {
            members: {
              select: {
                id: true,
              },
            },
          },
        });

        const memberIdsArray = memberIds?.members.map((member) => member.id) || [];
        if (memberIdsArray.length === 0) throw new Error("No members in group");

        const results = await prisma.gameScore.findMany({
          where: {
            userId: {
              in: memberIdsArray,
            },
            date: {
              gte: fromDate,
              lte: toDate,
            },
          },
          select: {
            userId: true,
            user: {
              select: {
                username: true,
                bgColor: true,
              },
            },
            score: true,
            comment: true,
            data: true,
            identifier: true,
            date: true,
            game: {
              select: {
                name: true,
              },
            },
          },
        });

        const myResultsObject: Record<string, GroupResultType> = {};
        // const myResults: (GroupResultType & { date: string })[] = [];
        const bestResultsObject: Record<string, GroupResultType> = {};
        // const bestResults: (GroupResultType & { date: string })[] = [];


        let startDate = startOfDay(fromDate);
        let endDate = endOfDay(fromDate);

        while (endDate.getTime() + 1 <= toDate.getTime()) {
          const formattedStartDate = format(startDate, "dd.MM.yyyy");
          if (!myResultsObject[formattedStartDate]) myResultsObject[formattedStartDate] = {};
          if (!bestResultsObject[formattedStartDate]) bestResultsObject[formattedStartDate] = {};

          const filteredResults = results.filter((result) => (
            result.date.getTime() >= startDate.getTime() && result.date.getTime() <= endDate.getTime()))
          filteredResults.forEach((result) => {
            if (result.userId === userId) {
              if (!myResultsObject[formattedStartDate]) myResultsObject[formattedStartDate] = {};
              if (result.game.name === "Wordle" || result.game.name === "Contexto") {
                (myResultsObject[formattedStartDate] as GroupResultType)[result.game.name] = {
                  score: result.score,
                  comment: result.comment,
                  data: result.data,
                  username: result.user.username || "",
                  userBgColor: result.user.bgColor || "#ff0000",
                  identifier: result.identifier,
                };
              }
            }

            if (!bestResultsObject[formattedStartDate]) bestResultsObject[formattedStartDate] = {};
            if (result.game.name === "Wordle" || result.game.name === "Contexto") {
              if (!(bestResultsObject[formattedStartDate] as GroupResultType)[result.game.name] || ((bestResultsObject[formattedStartDate] as GroupResultType)[result.game.name]?.score || 1000) > result.score) {
                (bestResultsObject[formattedStartDate] as GroupResultType)[result.game.name] = {
                  score: result.score,
                  comment: result.comment,
                  data: result.data,
                  username: result.user.username || "",
                  userBgColor: result.user.bgColor || "#ff0000",
                  identifier: result.identifier,
                };
              }
            }
          });

          // #9ab8f7

          // myResults.push({ ...myResultsObject[formattedStartDate], date: formattedStartDate });
          // bestResults.push({ ...bestResultsObject[formattedStartDate], date: formattedStartDate });

          startDate = addDays(startDate, 1);
          endDate = addDays(endDate, 1);
        }


        return {
          myResults: myResultsObject,
          bestResults: bestResultsObject,
        };
      }),

});
