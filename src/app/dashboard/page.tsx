"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const mockWorkouts = [
  {
    id: 1,
    name: "Morning Push",
    date: new Date(),
    exercises: ["Bench Press", "Overhead Press", "Tricep Dips"],
  },
  {
    id: 2,
    name: "Upper Body",
    date: new Date(),
    exercises: ["Pull-Ups", "Barbell Rows", "Bicep Curls"],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="mb-8">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-60 justify-start gap-2">
              <CalendarIcon className="size-4" />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-4">
          Workouts on {format(date, "do MMM yyyy")}
        </h2>

        {mockWorkouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {mockWorkouts.map((workout) => (
              <li key={workout.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                    <CardDescription>
                      {workout.exercises.length} exercise
                      {workout.exercises.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
