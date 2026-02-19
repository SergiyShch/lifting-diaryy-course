"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateWorkoutAction } from "./actions";

const formSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  workoutId: number;
  defaultName: string;
  defaultStartedAt: Date;
};

export function EditWorkoutForm({
  workoutId,
  defaultName,
  defaultStartedAt,
}: Props) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
      startedAt: defaultStartedAt,
    },
  });

  async function onSubmit(values: FormValues) {
    await updateWorkoutAction({ workoutId, name: values.name, startedAt: values.startedAt });
    router.push("/dashboard");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Push day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className="w-60 justify-start gap-2">
                      <CalendarIcon className="size-4" />
                      {format(field.value, "do MMM yyyy")}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(d) => {
                      if (d) field.onChange(d);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
