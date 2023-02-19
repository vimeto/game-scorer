import { type PrismaClient } from ".prisma/client";
import { format } from "date-fns";
import { GameNames, WordleEmojiMap, type WordleData } from "./types";

const getWordleIdentifier = () => {
  const wordleCreationDate = new Date("2021-06-19T00:00:00.000Z");
  const beginningOfToday = new Date();
  beginningOfToday.setHours(0, 0, 0, 0);
  return Math.floor((beginningOfToday.getTime() - wordleCreationDate.getTime()) / (1000 * 3600 * 24)) + 1;
}

const parseInput = (input: string): { data?: WordleData, error: string } => {
  const lines = input.split('\n');
  let firstLineFound = false;
  const data: WordleData = {
    id: 0,
    score: 0,
    rows: [],
  };


  const parseFirstLine = (line: string) => {
    const re = /Wordle (\d+) (\d+)\/(\d+)/;
    const match = line.match(re);
    if (match) {
      const [, id, x] = match;
      const identifier = Number(id) || 0;
      // if identifier is not todays or yesterdays wordle, throw error
      // if (identifier > getWordleIdentifier() + 5 || identifier < getWordleIdentifier() - 5) throw new Error;

      data.id = identifier;
      data.score = Number(x) || 0;
      firstLineFound = true;
    }
  };

  for (const line of lines) {
    if (!firstLineFound) {
      try {
        parseFirstLine(line);
      } catch (e: unknown) {
        return {
          error: "Identifier does not match today's wordle"
        }
      }
      continue;
    }

    const row: number[] = [];
    console.log(line);

    for (const char of line) {
      if (char in WordleEmojiMap) {
        row.push(WordleEmojiMap[char as keyof typeof WordleEmojiMap]);
      }
    }

    if (row.length === 5) {
      data.rows.push(row);
    }
  }

  if (!firstLineFound) {
    return {
      error: "Unable to find first line"
    }
  }

  console.log(data.rows);

  if (data.rows.length > 0 && (data.rows[data.rows.length - 1] as number[]).every((value) => value === 2)) {
    const score = data.score;
    const lengthOfRows = data.rows.length;

    if (score !== lengthOfRows) {
      return {
        error: "Score does not match length of rows"
      }
    } else return {
      data: data,
      error: ""
    }
  }

  return {
    error: "Unable to find last row"
  }
}

const updateWordleStreaksWithDelay = async (prisma: PrismaClient, userId: string, fromIdentifier: number) => {
  const wordleStreaks = await prisma.gameScore.findMany({
    where: {
      userId,
      game: {
        name: GameNames.WORDLE,
      },
      identifier: {
        gte: fromIdentifier,
      },
    },
    orderBy: {
      identifier: "asc",
    },
  });

  if (wordleStreaks.length <= 1 || !wordleStreaks[0]) return;

  let runningStreak = wordleStreaks[0].streak;
  let previousIdentifier = wordleStreaks[0].identifier;

  // map every wordleStreak except the first one

  const promises = wordleStreaks.slice(1).map(async (wordleStreak) => {
    const identifier = wordleStreak.identifier;
    const streak = wordleStreak.streak;
    console.log(identifier, streak, runningStreak, previousIdentifier);
    if (identifier - 1 === previousIdentifier) {
      // TODO: simplify if statement
      runningStreak += 1;
      previousIdentifier = identifier;

      await prisma.gameScore.update({
        where: { id: wordleStreak.id },
        data: { streak: runningStreak },
      });
    }
    else {
      runningStreak = 1;
      previousIdentifier = identifier;

      await prisma.gameScore.update({
        where: { id: wordleStreak.id },
        data: { streak: 1 },
      });
    }
  });

  await Promise.all(promises);
}

const getDateFromWordleIdentifier = (identifier: number) => {
  const wordleCreationDate = new Date("2021-06-19T00:00:00.000Z");
  const date = new Date(wordleCreationDate.getTime() + identifier * 1000 * 3600 * 24);
  return format(date, 'dd.MM.yyyy');
}

export {
  parseInput,
  getWordleIdentifier,
  updateWordleStreaksWithDelay,
  getDateFromWordleIdentifier,
}
