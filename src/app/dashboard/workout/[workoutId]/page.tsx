import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { workoutId: workoutIdParam } = await params;
  const workoutId = parseInt(workoutIdParam, 10);

  if (isNaN(workoutId)) {
    notFound();
  }

  const workout = await getWorkoutById(workoutId, userId);

  if (!workout) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        defaultName={workout.name ?? ""}
        defaultStartedAt={workout.startedAt}
      />
    </main>
  );
}
