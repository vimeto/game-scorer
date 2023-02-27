import { z } from "zod";
import { GameNames, type GroupResultType, UserGroupRoleNames, type GroupedUserGroupScoreValueTypes, getContextoIdentifierFromWordleIdentifier, type GroupUsers, type LeaderBoardObject } from "../../../entities/types";
import { getDateFromWordleIdentifier } from "../../../entities/wordleHelper";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

type UserGroupQueryType = {
  gameName: string;
  userGroupId: string;
  userGroupName: string;
  username: string;
  score: number;
}

const getTodayIndexSelectionShape = z.object({
  wordleIdentifier: z.number(),
});

const getGroupShape = z.object({
  id: z.string(),
});

const getWeekResultsShape = z.object({
  id: z.string(),
  fromWordleIdentifier: z.number(),
  toWordleIdentifier: z.number(),
})

const createGroupShape = z.object({
  name: z.string(),
});

const autocompleteAddUserShape = z.object({
  id: z.string(),
  inputValue: z.string(),
});

const addUserToGroupShape = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.enum([UserGroupRoleNames.ADMIN, UserGroupRoleNames.MEMBER]),
});

const inviteUserToGroupShape = z.object({
  id: z.string(),
  email: z.string(),
});

// "21.11.2023": { wordle: { score: string; comment?: string; data: JSON }, contexto: { score: string; comment?: string; data?: JSON } }

export const groupRouter = createTRPCRouter({
  getTodayIndexSelection: protectedProcedure
    .input(getTodayIndexSelectionShape)
    .query(async ({ ctx, input }) => {
      const { wordleIdentifier } = input;
      const userId = ctx.session.user.id;
      if (!userId) throw new Error("User not found");

      const contextoIdentifier = getContextoIdentifierFromWordleIdentifier(wordleIdentifier);

      const result = await prisma.$queryRaw<UserGroupQueryType[]>`
        SELECT Game.name AS gameName, UserGroup.id AS userGroupId, UserGroup.name AS userGroupName, u1.username AS username, MIN(GameScore.score) AS score
        FROM UserGroup
        JOIN UserGroupRole ugr1 ON ugr1.userGroupId = UserGroup.id
        JOIN User u1 ON ugr1.userId = u1.id
        JOIN UserGroupRole ugr2 ON ugr2.userGroupId = UserGroup.id
        JOIN User u2 ON ugr2.userId = u2.id
        JOIN GameScore ON GameScore.userId = u1.id
        JOIN Game ON GameScore.gameId = Game.id
        WHERE ((Game.name = ${GameNames.CONTEXTO} AND GameScore.identifier = ${contextoIdentifier}) OR
        (Game.name = ${GameNames.WORDLE} AND GameScore.identifier = ${wordleIdentifier})) AND
        u2.id = ${userId} AND
        ugr1.name IN (${UserGroupRoleNames.ADMIN}, ${UserGroupRoleNames.MEMBER})
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
          userGroupRoles: {
            some: {
              user: {
                id: userId,
              }
            },
          },
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
            userGroupRoles: {
              select: {
                name: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    bgColor: true,
                  },
                },
                userInvitation: {
                  select: {
                    id: true,
                    email: true,
                  }
                }
              },
            },
          },
        });

        if (!group) {
          // TODO: test that this error is shown to user
          throw new Error("Group not found");
        }

        return { group };
      }),
      weekResults: protectedProcedure
      .input(getWeekResultsShape)
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.session.user.id;
        const { fromWordleIdentifier, toWordleIdentifier, id } = input;
        if (!userId) throw new Error("User not found");

        const memberIds = await prisma.userGroup.findUnique({
          where: {
            id,
          },
          select: {
            userGroupRoles: {
              select: {
                user: {
                  select: {
                    id: true,
                  }
                }
              },
              where: {
                name: {
                  in: [UserGroupRoleNames.MEMBER, UserGroupRoleNames.ADMIN],
                }
              }
            },
          },
        });

        const memberIdsArray = (memberIds?.userGroupRoles.map((userGroupRole) => userGroupRole?.user?.id) || []).filter((id): id is string => !!id);
        if (memberIdsArray.length === 0) throw new Error("No members in group");

        // TODO: update this to use the new identifier approach
        const results = await prisma.gameScore.findMany({
          where: {
            userId: {
              in: memberIdsArray,
            },
            OR: [
              {
                game: { name: GameNames.CONTEXTO },
                identifier: {
                  gte: getContextoIdentifierFromWordleIdentifier(fromWordleIdentifier),
                  lte: getContextoIdentifierFromWordleIdentifier(toWordleIdentifier),
                }
              },
              {
                game: { name: GameNames.WORDLE },
                identifier: {
                  gte: fromWordleIdentifier,
                  lte: toWordleIdentifier,
                }
              }
            ]
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
            game: {
              select: {
                name: true,
              },
            },
          },
        });

        const myResultsObject: Record<string, GroupResultType> = {};
        const bestResultsObject: Record<string, GroupResultType> = {};

        let runningIdentifier = fromWordleIdentifier;

        while (runningIdentifier <= toWordleIdentifier) {
          const formattedDate = getDateFromWordleIdentifier(runningIdentifier);
          if (!myResultsObject[formattedDate]) myResultsObject[formattedDate] = {};
          if (!bestResultsObject[formattedDate]) bestResultsObject[formattedDate] = {};

          const filteredResults = results.filter((result) => (
            (result.game.name === GameNames.WORDLE && result.identifier === runningIdentifier) ||
            (result.game.name === GameNames.CONTEXTO && result.identifier === getContextoIdentifierFromWordleIdentifier(runningIdentifier))));

          filteredResults.forEach((result) => {
            if (result.userId === userId) {
              if (!myResultsObject[formattedDate]) myResultsObject[formattedDate] = {};
              if (result.game.name === GameNames.WORDLE || result.game.name === GameNames.CONTEXTO) {
                (myResultsObject[formattedDate] as GroupResultType)[result.game.name] = [{
                  score: result.score,
                  comment: result.comment,
                  data: result.data,
                  username: result.user.username || "",
                  userBgColor: result.user.bgColor || "#ff0000",
                  identifier: result.identifier,
                }];
              }
            }
            if (result.game.name === GameNames.WORDLE || result.game.name === GameNames.CONTEXTO) {
              if (!(bestResultsObject[formattedDate] as GroupResultType)[result.game.name] || (bestResultsObject[formattedDate] as GroupResultType)[result.game.name]?.length === 0) {
                (bestResultsObject[formattedDate] as GroupResultType)[result.game.name] = [{
                  score: result.score,
                  comment: result.comment,
                  data: result.data,
                  username: result.user.username || "",
                  userBgColor: result.user.bgColor || "#ff0000",
                  identifier: result.identifier,
                }];
              }
              else if ((bestResultsObject[formattedDate] as GroupResultType)[result.game.name] && (bestResultsObject[formattedDate] as GroupResultType)[result.game.name]?.length || 0 > 0) {
                const firstResult = ((bestResultsObject[formattedDate] as GroupResultType)[result.game.name] || [])[0];
                if (!firstResult) return;

                if (firstResult.score > result.score) {
                  (bestResultsObject[formattedDate] as GroupResultType)[result.game.name] = [{
                    score: result.score,
                    comment: result.comment,
                    data: result.data,
                    username: result.user.username || "",
                    userBgColor: result.user.bgColor || "#ff0000",
                    identifier: result.identifier,
                  }];
                }

                else if (firstResult.score === result.score) {
                  (bestResultsObject[formattedDate] as GroupResultType)[result.game.name] = [
                    ...((bestResultsObject[formattedDate] as GroupResultType)[result.game.name] || []),
                    {
                      score: result.score,
                      comment: result.comment,
                      data: result.data,
                      username: result.user.username || "",
                      userBgColor: result.user.bgColor || "#ff0000",
                      identifier: result.identifier,
                    },
                  ];
                }
              }
            }
          });
          runningIdentifier += 1;
        }

        const users = {} as GroupUsers;
        const leaderBoards = {
          Wordle: {},
          Contexto: {},
        } as LeaderBoardObject;

        Object.keys(bestResultsObject).forEach((date) => {
          const dayObject = bestResultsObject[date];
          if (!dayObject) return;

          if (dayObject.Wordle && dayObject.Wordle.length > 0 && dayObject.Wordle[0]) {
            if (dayObject.Wordle.length > 1) {
              if (!leaderBoards.Wordle["tie"]) {
                leaderBoards.Wordle["tie"] = 1;
              } else {
                leaderBoards.Wordle["tie"] += 1;
              }
            } else {
              const username = dayObject.Wordle[0].username;
              if (!users[username]) {
                users[username] =  { userBgColor: dayObject.Wordle[0].userBgColor };
              }
              if (!leaderBoards.Wordle[username]) {
                leaderBoards.Wordle[username] = 1;
              } else {
                leaderBoards.Wordle[username] += 1;
              }
            }
          }
          if (dayObject.Contexto && dayObject.Contexto.length > 0 && dayObject.Contexto[0]) {
            if (dayObject.Contexto.length > 1) {
              if (!leaderBoards.Contexto["tie"]) {
                leaderBoards.Contexto["tie"] = 1;
              } else {
                leaderBoards.Contexto["tie"] += 1;
              }
            } else {
              const username = dayObject.Contexto[0].username;
              if (!users[username]) {
                users[username] =  { userBgColor: dayObject.Contexto[0].userBgColor };
              }
              if (!leaderBoards.Contexto[username]) {
                leaderBoards.Contexto[username] = 1;
              } else {
                leaderBoards.Contexto[username] += 1;
              }
            }
          }
        });

        return {
          myResults: myResultsObject,
          bestResults: bestResultsObject,
          users,
          leaderBoards,
        };
      }),
      create: protectedProcedure
      .input(createGroupShape)
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.session.user.id;
        if (!userId) throw new Error("User not found");

        const group = await prisma.userGroup.create({
          data: {
            name: input.name,
            userGroupRoles: {
              create: {
                user: {
                  connect: {
                    id: userId,
                  },
                },
                name: UserGroupRoleNames.ADMIN,
              },
            },
          },
        });

        return { group };
      }),
      autocompleteAddUser: protectedProcedure
      .input(autocompleteAddUserShape)
      .mutation(async ({ input, ctx }) => {
        const { inputValue, id } = input;
        const userId = ctx.session.user.id;
        if (!userId) throw new Error("User not found");

        const users = await prisma.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { username: { contains: inputValue } },
                  { email: { contains: inputValue } },
                ],
              },
              {
                NOT: {
                  userGroupRoles: {
                    some: {
                      userGroupId: id,
                    },
                  },
                },
              },
            ],
          },
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            bgColor: true,
            email: true,
          },
          take: 3,
        });

        console.log(users);

        if (!users) throw new Error("User not found");

        return { users };
      }),
    addUserToGroup: protectedProcedure
      .input(addUserToGroupShape)
      .mutation(async ({ input, ctx }) => {
        const { id, userId, role } = input;
        const currentUserId = ctx.session.user.id;
        if (!currentUserId) throw new Error("User not found");

        const conflictingRole = await prisma.userGroupRole.findFirst({
          where: {
            userGroupId: id,
            userId: userId,
          },
        });
        console.log(conflictingRole);
        if (conflictingRole) throw new Error("User already added");

        const userGroupRole = await prisma.userGroupRole.create({
          data: {
            user: {
              connect: {
                id: userId,
              },
            },
            userGroup: {
              connect: {
                id,
              },
            },
            name: role,
          },
        });

        return { userGroupRole };
      }),
      inviteUserToUserGroup: protectedProcedure
      .input(inviteUserToGroupShape)
      .mutation(async ({ input, ctx }) => {
        const { id, email } = input;
        const currentUserId = ctx.session.user.id;
        if (!currentUserId) throw new Error("User not found");

        const conflictingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { username: email },
              { email: email },
            ],
          },
        });
        if (conflictingUser) throw new Error("User already exists");

        const conflictingUserGroupRole = await prisma.userGroupRole.findFirst({
          where: {
            userGroupId: id,
            OR: [
              { user: { username: email } },
              { user: { email: email } },
              { userInvitation: { email: email } },
            ],
          },
        });
        if (conflictingUserGroupRole) throw new Error("Invitation already exists");


        const role = await prisma.userGroupRole.create({
          data: {
            name: UserGroupRoleNames.PENDING,
            userGroup: {
              connect: {
                id,
              },
            },
            userInvitation: {
              create: {
                email,
              },
            },
          }
        });
        // TODO: send email to email

        return { userGroupRole: role };
      }),
});
