import { Star } from "lucide-react";

interface StarsProps {
  value: number | null;
  interactive?: boolean;
  onChange?: (value: number) => void;
  showEmpty?: boolean;
  size?: number;
}

export function Stars({
  value,
  interactive = false,
  onChange,
  showEmpty = false,
  size = 16,
}: StarsProps) {
  if (!interactive && !showEmpty && !value) return null;
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={value ? `Nota ${value} de 5` : "Sem nota"}>
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="rounded-sm p-0.5 transition-transform hover:scale-110"
            aria-label={`Dar nota ${star}`}
            aria-pressed={star === value}
          >
            <Star
              size={size}
              className={star <= (value ?? 0) ? "fill-star text-star" : "text-border-strong"}
            />
          </button>
        ) : (
          <Star
            key={star}
            size={size}
            className={star <= (value ?? 0) ? "fill-star text-star" : "text-border-strong"}
          />
        ),
      )}
    </div>
  );
}
