import { type ContextoData } from "./types";

// const input = `I played contexto.me #133 and got it in 103 guesses.

// 🟩 10
// 🟨🟨🟨 20
// 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥 73`;


const parseInput = (input: string): { data?: ContextoData, error: string } => {
  const lines = input.split('\n');
  let firstLineFound = false;
  const data: ContextoData = {
    id: 0,
    score: 0,
    scores: {
      "green": null,
      "yellow": null,
      "red": null,
    },
  };

  const parseFirstLine = (line: string) => {
    const re = /contexto\.me #(\d+) and got it in (\d+) guesses\./;
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

    const reGreen = /🟩+ (\d+)/;
    const reYellow = /🟨+ (\d+)/;
    const reRed = /🟥+ (\d+)/;

    const matchGreen = line.match(reGreen);
    const matchYellow = line.match(reYellow);
    const matchRed = line.match(reRed);

    if (matchGreen && data.scores.green === null) {
      const [, x] = matchGreen;
      data.scores.green = Number(x) || 0;
    } else if (data.scores.green !== null && data.scores.yellow === null) {
      // need extra check because yellow can be empty
      let yellowScore = null;
      if (matchYellow) { yellowScore = Number(matchYellow[1]) || 0; }
      else {
        const reYellowEmpty = / (\d+)/;
        const matchYellowEmpty = line.match(reYellowEmpty);
        if (matchYellowEmpty) { yellowScore = Number(matchYellowEmpty[1]) || 0; }
      }

      if (yellowScore !== null) { data.scores.yellow = yellowScore; }
    } else if (data.scores.green !== null && data.scores.yellow !== null && data.scores.red === null) {
      let redScore = null;
      if (matchRed) { redScore = Number(matchRed[1]) || 0; }
      else {
        const re = / (\d+)/;
        const match = line.match(re);
        if (match) { redScore = Number(match[1]) || 0; }
      }
      if (redScore !== null) { data.scores.red = redScore; }
    }
  }

  console.log(data);

  if (!firstLineFound) {
    return { error: "First line not found" };
  }

  if (Object.values(data.scores).every((value) => value !== null)) {
    const sum = Object.values(data.scores).reduce((a, b) => (a || 0) + (b || 0), 0);
    if (sum !== data.score) {
      return {
        error: `Score is not equal to sum of scores, something is wrong. Score: ${data.score}, Sum: ${sum || 0}`,
      }
    }
    else {
      return { data, error: "" };
    }
  }

  return { error: "Invalid scores" };

}




// if (data.rows[data.rows.length - 1].every((value) => value === 2)) {
//   const score = data.score;
//   const lengthOfRows = data.rows.length;

//   if (score !== lengthOfRows) {
//     console.log("Score is not equal to length of rows, something is wrong");
//   } else {
//     console.log(`Found Wordle ${data.id} with ${score} guesses`);
//   }
// }


export {
  parseInput,
}
