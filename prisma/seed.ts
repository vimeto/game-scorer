// import { prisma } from '../src/server/db';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import bcryptjs from 'bcryptjs';
import { GameNames, UserGroupRoleNames } from '../src/entities/types';


const userDatas = [
  {
    firstName: "Vilhelm",
    lastName: "Toivonen",
    email: "vilhelm.toivonen@gmail.com",
    username: "vimetoivonen",
    password: "password1234",
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@gmail.com",
    username: "johndoe",
    password: "password1234",
  },
] as const;

const seedUsers = async () => {
  for (const userData of userDatas) {
    const conflictingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username },
        ],
      },
    });

    if (conflictingUser) continue;

    // TODO: update to use createMany
    const passwordDigest = await bcryptjs.hash(userData.password, 10);
    await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        passwordDigest,
        emailVerified: new Date(),
      },
    });
  }
}

const seedUserGroups = async () => {
  const userGroupName = "Group 1";
  const user1 = await prisma.user.findUnique({
    where: { username: userDatas[0].username },
    include: {
      userGroupRoles: {
        include: { userGroup: { select: { name: true } } },
      },
    },
  });
  const user2 = await prisma.user.findUnique({
    where: { username: userDatas[1].username },
    include: {
      userGroupRoles: {
        include: { userGroup: { select: { name: true } } },
      },
    },
  });
  if (!user1 || !user2 ||
      user1.userGroupRoles.find(ugr => ugr.userGroup.name === userGroupName) ||
      user2.userGroupRoles.find(ugr => ugr.userGroup.name === userGroupName))  {
      return;
    }

  await prisma.userGroup.create({
    data: {
      name: userGroupName,
      userGroupRoles: {
        create: [
          { name: UserGroupRoleNames.ADMIN, user: { connect: { id: user1.id } } },
          { name: UserGroupRoleNames.ADMIN, user: { connect: { id: user2.id } } },
        ]
      },
    },
  });
}

const seedGames = async () => {
  const wordleName = GameNames.WORDLE;
  const contextoName = GameNames.CONTEXTO;
  await prisma.game.upsert({
    where: { name: wordleName },
    update: {},
    create: { name: wordleName },
  });
  await prisma.game.upsert({
    where: { name: contextoName },
    update: {},
    create: { name: contextoName },
  });
}


const seed = async () => {
  await seedUsers();
  await seedUserGroups();
  await seedGames();
}

seed().catch(e => console.error(e));
