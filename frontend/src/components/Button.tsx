import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98]",
  outline:
    "border-border-strong bg-transparent text-ink hover:border-primary hover:bg-muted active:scale-[0.98]",
  ghost:
    "border-transparent bg-transparent text-ink-muted hover:bg-muted hover:text-ink active:scale-[0.98]",
  danger:
    "border-danger bg-danger text-white hover:brightness-95 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
