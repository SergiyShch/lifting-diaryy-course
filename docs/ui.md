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

## Forms

**All forms must use the shadcn/ui Form component**, which is built on [react-hook-form](https://react-hook-form.com/) and integrated with Zod for validation.

Never use raw `<form>` elements with manual `useState` for field values. Always use `useForm` + `zodResolver` + the `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, and `FormMessage` components.

Install the component if not present:

```bash
npx shadcn@latest add form
```

### Required structure

Every form must:

1. Define a Zod schema with `z.object()`
2. Call `useForm` with `zodResolver(schema)` and `defaultValues`
3. Wrap the `<form>` element in `<Form {...form}>` (the FormProvider)
4. Use `<FormField>` with a `render` prop for every field
5. Use `form.formState.isSubmitting` for the pending state — no separate `useState` for this

### Example

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

type FormValues = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  })

  async function onSubmit(values: FormValues) {
    await saveAction(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter a name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save"}
        </Button>
      </form>
    </Form>
  )
}
```

### Custom controls (e.g. date picker)

For non-input controls like a calendar, wrap the trigger in `<FormControl>` inside the `render` prop and call `field.onChange` manually:

```tsx
<FormField
  control={form.control}
  name="startedAt"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline">
              {format(field.value, "do MMM yyyy")}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={(d) => { if (d) field.onChange(d) }}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
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
