import { WordleEmojiMap, type WordleData } from "./types";

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
      data.id = Number(id) || 0;
      data.score = Number(x) || 0;
      firstLineFound = true;
    }
  };

  for (const line of lines) {
    if (!firstLineFound) {
      parseFirstLine(line);
      continue;
    }

    const row: number[] = [];

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
}
