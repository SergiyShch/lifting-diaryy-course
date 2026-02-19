"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ dateString }: { dateString: string }) {
  const router = useRouter();
  const date = parseISO(dateString);

  return (
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
          onSelect={(d) => {
            if (d) {
              router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
