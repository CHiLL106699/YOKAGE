import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { zhTW } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "選擇日期範圍",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const presets = [
    {
      label: "今天",
      getValue: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      label: "最近 7 天",
      getValue: () => ({
        from: subDays(new Date(), 6),
        to: new Date(),
      }),
    },
    {
      label: "最近 30 天",
      getValue: () => ({
        from: subDays(new Date(), 29),
        to: new Date(),
      }),
    },
    {
      label: "本月",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      label: "本年",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      }),
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "yyyy/MM/dd", { locale: zhTW })} -{" "}
                {format(value.to, "yyyy/MM/dd", { locale: zhTW })}
              </>
            ) : (
              format(value.from, "yyyy/MM/dd", { locale: zhTW })
            )
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-2 space-y-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange(preset.getValue());
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              清除
            </Button>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={zhTW}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Hook for date range state management
export function useDateRange(defaultRange?: DateRange) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultRange);

  const clear = () => setDateRange(undefined);

  const setPreset = (preset: "today" | "week" | "month" | "year") => {
    const now = new Date();
    switch (preset) {
      case "today":
        setDateRange({ from: now, to: now });
        break;
      case "week":
        setDateRange({ from: subDays(now, 6), to: now });
        break;
      case "month":
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case "year":
        setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        break;
    }
  };

  return {
    dateRange,
    setDateRange,
    clear,
    setPreset,
    from: dateRange?.from,
    to: dateRange?.to,
  };
}
