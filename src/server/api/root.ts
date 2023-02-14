import { userRouter } from "./routers/user";
import { wordleRouter } from "./routers/wordle";
import { contextoRouter } from "./routers/contexto";
import { cardsRouter } from "./routers/cards";
import { groupRouter } from "./routers/group";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  wordle: wordleRouter,
  contexto: contextoRouter,
  cards: cardsRouter,
  group: groupRouter,
});

export type AppRouter = typeof appRouter;
