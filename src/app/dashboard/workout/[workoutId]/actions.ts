"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1),
  startedAt: z.coerce.date(),
});

type UpdateWorkoutParams = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(params: UpdateWorkoutParams) {
  const { workoutId, name, startedAt } = updateWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateWorkout(workoutId, userId, name, startedAt);
}
