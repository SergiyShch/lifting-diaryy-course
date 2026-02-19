# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

No custom UI components should be created. If a UI element is needed, find the appropriate shadcn/ui component and install it via the CLI:

```bash
npx shadcn@latest add <component-name>
```

Installed components live in `src/components/ui/` and must not be modified unless absolutely necessary to fix a bug (not to add features or change aesthetics).

**Configuration** (`components.json`):
- Style: `new-york`
- Base color: `neutral`
- Icon library: `lucide`
- CSS variables enabled

### Examples

```tsx
// Correct — using shadcn/ui Button
import { Button } from "@/components/ui/button"

<Button variant="outline">Save</Button>
```

```tsx
// Wrong — custom component
const MyButton = ({ children }) => (
  <button className="bg-blue-500 px-4 py-2 rounded">{children}</button>
)
```

## Date Formatting

All dates must be formatted using **date-fns**. Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting approach.

### Required Format

Dates are displayed as `{ordinal} {Mon} {YYYY}`:

| Date | Display |
|------|---------|
| 2025-09-01 | 1st Sep 2025 |
| 2025-08-02 | 2nd Aug 2025 |
| 2026-01-03 | 3rd Jan 2026 |
| 2024-06-04 | 4th Jun 2024 |

### Implementation

Use the `do` token (ordinal day) combined with `MMM` and `yyyy`:

```ts
import { format } from "date-fns"

format(date, "do MMM yyyy")
// 1st Sep 2025
// 2nd Aug 2025
// 3rd Jan 2026
```
