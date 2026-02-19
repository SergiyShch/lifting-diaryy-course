# Authentication Standards

## Provider: Clerk

**This application uses [Clerk](https://clerk.com) for all authentication.** Do not implement custom auth, use NextAuth, or introduce any other authentication library.

Clerk is installed via `@clerk/nextjs` and `@clerk/nextjs/server`.

## Setup

### Provider

The root layout wraps the entire application in `<ClerkProvider>`:

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware

Clerk middleware is registered in `src/middleware.ts` using the standard matcher pattern:

```ts
// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Do not remove or customize the matcher without a clear reason.

## Getting the Current User

### In Server Components and Server Actions

Use `auth()` from `@clerk/nextjs/server` to retrieve the current session. This is the **only** approved way to get the authenticated user's ID on the server.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `userId` is `string | null` — it is `null` when the user is not signed in.
- When a page requires authentication, assert `userId` is non-null before using it (e.g., `userId!` or an explicit redirect).

### In Client Components

Use the `useAuth` or `useUser` hooks from `@clerk/nextjs`:

```tsx
"use client";
import { useAuth } from "@clerk/nextjs";

const { userId, isSignedIn } = useAuth();
```

**Do not** pass `userId` down from a server component to a client component just to re-use it — call `useAuth()` directly in the client component instead.

## UI Components

Use Clerk's built-in UI components for all sign-in/sign-up/user flows. Do not build custom auth UI.

| Component | Purpose |
|-----------|---------|
| `<SignedIn>` | Renders children only when the user is authenticated |
| `<SignedOut>` | Renders children only when the user is not authenticated |
| `<SignInButton mode="modal">` | Opens the Clerk sign-in modal |
| `<SignUpButton mode="modal">` | Opens the Clerk sign-up modal |
| `<UserButton>` | Renders the user avatar/menu with sign-out |

```tsx
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

<SignedOut>
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

Always use `mode="modal"` for `SignInButton` and `SignUpButton` so the user stays on the current page.

## Protecting Pages

To protect a page, call `auth()` at the top of the Server Component and handle the unauthenticated case:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // ...
}
```

Do not rely solely on middleware to protect individual pages — always check `userId` in the page itself.

## Environment Variables

Clerk requires the following environment variables. These must be set in `.env.local` and **never committed to source control**:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```
