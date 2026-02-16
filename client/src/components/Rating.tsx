import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function Rating({
  value,
  max = 5,
  onChange,
  size = "md",
  readonly = false,
}: RatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(value);
        return (
          <Star
            key={i}
            className={cn(
              sizeMap[size],
              "transition-colors",
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300",
              !readonly && "cursor-pointer hover:text-yellow-400"
            )}
            onClick={() => {
              if (!readonly && onChange) {
                onChange(starValue);
              }
            }}
          />
        );
      })}
    </div>
  );
}
