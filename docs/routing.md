# Routing Standards

## Route Structure

All application routes live under `/dashboard`. The root `/` is the public landing page.

```
/                          ← public landing page
/dashboard                 ← protected dashboard (main app entry point)
/dashboard/workout/new     ← protected: create a new workout
/dashboard/workout/[id]    ← protected: view/edit a specific workout
```

New pages must be added under `/dashboard`. Do not create top-level app routes for authenticated features.

## Route Protection via Middleware

All `/dashboard` routes are protected at the middleware level using Clerk's `createRouteMatcher`. This is the **primary** mechanism for protecting routes — individual pages do **not** need to repeat the auth redirect logic.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- `auth.protect()` redirects unauthenticated users to the Clerk sign-in page automatically.
- Do **not** use a bare `clerkMiddleware()` with no route protection logic.
- Do **not** add per-page `redirect("/")` auth guards in dashboard pages — middleware handles this.

## File System Conventions

Routes follow Next.js App Router conventions under `src/app/`:

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Public landing page (`/`) |
| `src/app/dashboard/page.tsx` | Dashboard index (`/dashboard`) |
| `src/app/dashboard/[feature]/page.tsx` | Feature page under dashboard |
| `src/app/dashboard/[feature]/[id]/page.tsx` | Dynamic route under dashboard |
| `src/app/dashboard/[feature]/[id]/actions.ts` | Server actions for that route |

Co-locate server actions in an `actions.ts` file alongside the page that uses them.

## Navigation

Use Next.js `<Link>` for all internal navigation. Do not use `<a href>` tags for app routes.

```tsx
import Link from "next/link";

<Link href="/dashboard">Dashboard</Link>
<Link href={`/dashboard/workout/${workout.id}`}>View workout</Link>
```

## Dynamic Routes

Use `[paramName]` folder segments for dynamic routes. The param name should match the entity (e.g., `[workoutId]`, not `[id]`).

```
src/app/dashboard/workout/[workoutId]/page.tsx   ✓
src/app/dashboard/workout/[id]/page.tsx          ✗
```

Access params via the `params` prop, which is a `Promise` in Next.js 15+:

```tsx
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // ...
}
```

## Search Params

Pass filter/view state via URL search params rather than component state where the value should be bookmarkable or shareable (e.g., selected date on the dashboard).

Access them via the `searchParams` prop, which is also a `Promise`:

```tsx
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  // ...
}
```
