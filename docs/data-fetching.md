# Data Fetching Standards

## CRITICAL: Server Components Only

**ALL data fetching in this application MUST be done exclusively via Server Components.**

This is a strict rule with no exceptions:

- **DO NOT** fetch data in Client Components (components with `"use client"`)
- **DO NOT** fetch data via Route Handlers (files in `src/app/api/`)
- **DO NOT** use `useEffect` + `fetch` or any other client-side fetching pattern
- **DO NOT** use SWR, React Query, or any client-side data fetching library

Data must flow one way: database → server component → (optionally passed as props to) client components.

## Database Queries via Helper Functions

All database queries MUST go through helper functions defined in the `/data` directory.

- **DO NOT** write raw SQL anywhere in the codebase
- **DO NOT** query the database directly from a page or component
- **ALWAYS** use Drizzle ORM inside helper functions in `/data`

### Example structure

```
src/
  data/
    workouts.ts     # e.g. getWorkoutsForUser(), getWorkoutById()
    exercises.ts    # e.g. getExercisesForUser()
```

### Example helper function

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Example server component usage

```tsx
// src/app/dashboard/page.tsx
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);

  return <WorkoutList workouts={workouts} />;
}
```

## Authorization: Users May Only Access Their Own Data

Every helper function in `/data` MUST scope its query to the authenticated user's ID.

- **ALWAYS** accept a `userId` parameter (or resolve it inside the function from the session) and filter by it
- **NEVER** return data that belongs to a different user
- **NEVER** trust user-supplied IDs without verifying ownership against the authenticated session

### Bad (insecure — no ownership check)

```ts
// NEVER do this
export async function getWorkout(workoutId: string) {
  return db.select().from(workouts).where(eq(workouts.id, workoutId));
}
```

### Good (secure — ownership enforced)

```ts
export async function getWorkout(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}
```

Always pass the authenticated `userId` from the session — never from user input or URL params alone.
