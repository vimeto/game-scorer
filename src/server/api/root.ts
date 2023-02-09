import { userRouter } from "./routers/user";
import { wordleRouter } from "./routers/wordle";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  wordle: wordleRouter,
});

export type AppRouter = typeof appRouter;
