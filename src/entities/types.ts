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
    identifier: number;
  }[];
  Contexto?: {
    score: number;
    comment: string | null;
    data: JSONValue | null;
    username: string;
    userBgColor: string;
    identifier: number;
  }[];
}

type GroupUsers = Record<string, {
  userBgColor: string;
}>;

interface LeaderBoardObject {
  Wordle: Record<string, number>;
  Contexto: Record<string, number>;
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

const getContextoIdentifierFromWordleIdentifier = (wordleIdentifier: number) => {
  return wordleIdentifier - 456;
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
  getContextoIdentifierFromWordleIdentifier,
  type GroupUsers,
  type LeaderBoardObject,
  // ContextoEmojiMap,
}
