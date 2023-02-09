interface WordleData {
  id: number;
  score: number;
  rows: number[][];
}

const WordleEmojiMap = {
  '⬜': 0,
  '🟨': 1,
  '🟩': 2,
}

export {
  type WordleData,
  WordleEmojiMap
}
