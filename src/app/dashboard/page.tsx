import { auth } from "@clerk/nextjs/server";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { getWorkoutsForUser } from "@/data/workouts";
import { DatePicker } from "@/components/date-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const date = dateParam ? parseISO(dateParam) : new Date();
  const workoutList = await getWorkoutsForUser(userId!, date);

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="mb-8">
        <DatePicker dateString={format(date, "yyyy-MM-dd")} />
      </div>

      <section>
        <h2 className="text-lg font-medium mb-4">
          Workouts on {format(date, "do MMM yyyy")}
        </h2>

        {workoutList.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {workoutList.map((workout) => (
              <li key={workout.id}>
                <Link href={`/dashboard/workout/${workout.id}`}>
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                    <CardDescription>
                      {workout.exercises.length} exercise
                      {workout.exercises.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        Started: {format(workout.startedAt, "h:mm a")}
                      </span>
                      {workout.completedAt ? (
                        <>
                          <span>
                            Ended: {format(workout.completedAt, "h:mm a")}
                          </span>
                          <Badge variant="default">Completed</Badge>
                        </>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {workout.exercises.map((exercise) => (
                        <li
                          key={exercise}
                          className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-md"
                        >
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
