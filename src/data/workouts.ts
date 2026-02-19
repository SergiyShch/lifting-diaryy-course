import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutById(workoutId: number, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}

export async function updateWorkout(
  workoutId: number,
  userId: string,
  name: string,
  startedAt: Date
) {
  await db
    .update(workouts)
    .set({ name, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function createWorkout(
  userId: string,
  name: string,
  startedAt: Date
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();

  return workout;
}

export async function getWorkoutsForUser(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfNextDay = new Date(date);
  startOfNextDay.setDate(startOfNextDay.getDate() + 1);
  startOfNextDay.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      workoutStartedAt: workouts.startedAt,
      workoutCompletedAt: workouts.completedAt,
      exerciseName: exercises.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, startOfNextDay)
      )
    )
    .orderBy(workouts.id, workoutExercises.order);

  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string | null;
      startedAt: Date;
      completedAt: Date | null;
      exercises: string[];
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.workoutStartedAt,
        completedAt: row.workoutCompletedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      workoutMap.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(workoutMap.values());
}
