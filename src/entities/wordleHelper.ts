import { WordleEmojiMap, type WordleData } from "./types";

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
      if (identifier > getWordleIdentifier() + 1 || identifier < getWordleIdentifier() - 1) throw new Error;

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

export {
  parseInput,
  getWordleIdentifier,
}
