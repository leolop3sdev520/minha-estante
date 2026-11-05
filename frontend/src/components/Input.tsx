import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = "", ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`h-11 w-full rounded-md border bg-surface px-3.5 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-border-strong"
        } ${props.disabled ? "cursor-not-allowed bg-muted text-ink-muted" : ""} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
