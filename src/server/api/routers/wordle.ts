import { z } from "zod";
import { parseInput } from "../../../entities/wordleHelper";
import { prisma } from "../../db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const updateScore = z.object({
  data: z.string(),
});

export const wordleRouter = createTRPCRouter({
  update: protectedProcedure
    .input(updateScore)
    .mutation(({ input }) => {
      const { data, error } = parseInput(input.data);

      if (error.length > 0) {
        throw new Error(error);
      }
      if (!data) {
        throw new Error("Unable to parse input");
      }

      // check that user has not already submitted a wordle, if so, error, else create

      return { data };
    }),
});
