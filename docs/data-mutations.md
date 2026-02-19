# Data Mutation Standards

## Helper Functions in `src/data`

**ALL database mutations MUST go through helper functions defined in the `src/data` directory.**

- **DO NOT** write Drizzle ORM calls directly in server actions, pages, or components
- **DO NOT** write raw SQL anywhere in the codebase
- **ALWAYS** encapsulate insert, update, and delete operations in named helper functions under `src/data`

### Example structure

```
src/
  data/
    workouts.ts     # e.g. createWorkout(), updateWorkout(), deleteWorkout()
    exercises.ts    # e.g. createExercise(), deleteExercise()
```

### Example helper functions

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

---

## Server Actions

**ALL mutations triggered from the UI MUST be implemented as Server Actions.**

- Server actions MUST live in colocated `actions.ts` files next to the page or feature that uses them
- **DO NOT** use Route Handlers (`src/app/api/`) for mutations
- **DO NOT** define server actions inside page or component files

### Example structure

```
src/
  app/
    workouts/
      page.tsx
      actions.ts    # server actions for the workouts feature
    workouts/[id]/
      page.tsx
      actions.ts    # server actions for the single workout page
```

---

## Typing Server Action Parameters

All server action parameters MUST be explicitly typed with TypeScript types.

- **DO NOT** use `FormData` as a parameter type
- **ALWAYS** define typed parameters — derive these from your Zod schema (see below)

### Bad

```ts
// NEVER do this
export async function createWorkoutAction(formData: FormData) { ... }
```

### Good

```ts
// Typed params derived from Zod schema
export async function createWorkoutAction(params: CreateWorkoutParams) { ... }
```

---

## Zod Validation

**ALL server actions MUST validate their arguments with Zod before doing anything else.**

- Define a Zod schema for every server action's input
- Call `.parse()` or `.safeParse()` at the top of every server action
- **NEVER** trust input data without validating it first

### Example

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

type CreateWorkoutParams = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(params: CreateWorkoutParams) {
  const { name, date } = createWorkoutSchema.parse(params);

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return createWorkout(session.user.id, name, date);
}
```

---

## Redirects After Server Actions

**NEVER call `redirect()` inside a server action.** Redirects must be handled client-side after the server action resolves.

- **DO NOT** import or call `redirect()` from `next/navigation` in an `actions.ts` file
- **ALWAYS** return from the server action and let the calling client component handle navigation via `useRouter`

### Bad

```ts
// NEVER do this
import { redirect } from "next/navigation";

export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  await createWorkout(userId, name, date);
  redirect("/dashboard"); // ❌
}
```

### Good

```ts
// actions.ts — just return, no redirect
export async function createWorkoutAction(params: CreateWorkoutParams) {
  // ...
  await createWorkout(userId, name, date);
}
```

```tsx
// client component — redirect after the action resolves
const router = useRouter();

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  await createWorkoutAction({ name, startedAt: date });
  router.push("/dashboard"); // ✅
}
```

---

## Authorization in Server Actions

Every server action that touches user data MUST verify the authenticated session.

- **ALWAYS** call `auth()` inside the server action and check for a valid session
- **NEVER** accept a `userId` as a parameter from the caller — always resolve it from the session
- Pass the authenticated `userId` to the `src/data` helper function to scope the mutation

### Bad (insecure — userId from caller)

```ts
// NEVER do this
export async function deleteWorkoutAction(workoutId: string, userId: string) {
  await deleteWorkout(workoutId, userId);
}
```

### Good (secure — userId from session)

```ts
export async function deleteWorkoutAction(params: DeleteWorkoutParams) {
  const { workoutId } = deleteWorkoutSchema.parse(params);

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await deleteWorkout(workoutId, session.user.id);
}
```
