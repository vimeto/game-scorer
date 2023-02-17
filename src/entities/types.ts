import { type JSONValue } from "superjson/dist/types";

interface WordleData {
  id: number;
  score: number;
  rows: number[][];
  comment?: string;
}

const WordleEmojiMap = {
  '⬜': 0,
  '⬛': 0,
  '🟨': 1,
  '🟩': 2,
}

interface ContextoData {
  id: number;
  score: number;
  scores: {
    green: number | null;
    yellow: number | null;
    red: number | null;
  };
  comment?: string;
}

// const ContextoEmojiMap = {
//   '🟥': 0,
//   '🟨': 1,
//   '🟩': 2,
// }

interface GroupedUserGroupScoreValueTypes {
  id: string;
  name: string;
  wordleWinner: { username: string; score: number; } | null;
  contextoWinner: { username: string; score: number; } | null;
}

interface GroupResultType {
  Wordle?: {
    score: number;
    comment: string | null;
    data: JSONValue | null;
    username: string;
    userBgColor: string;
    identifier: string;
  };
  Contexto?: {
    score: number;
    comment: string | null;
    data: JSONValue | null;
    username: string;
    userBgColor: string;
    identifier: string;
  }
}

enum UserGroupRoleNames {
  ADMIN = "admin",
  MEMBER = "member",
  PENDING = "pending",
}

enum GameNames {
  WORDLE = "Wordle",
  CONTEXTO = "Contexto",
}

interface InputTypes {
  valid: boolean;
  id: string;
  placeholder: string;
  title: string;
  value: string;
  setValue: (value: string) => void;
}

export {
  type WordleData,
  WordleEmojiMap,
  type ContextoData,
  type GroupedUserGroupScoreValueTypes,
  type GroupResultType,
  UserGroupRoleNames,
  GameNames,
  type InputTypes,
  // ContextoEmojiMap,
}
