import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "approve" | "adjust" | "reject";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-zinc-100 text-zinc-950 hover:bg-white",
  ghost:
    "border border-white/10 bg-transparent text-zinc-300 hover:bg-white/5",
  approve: "bg-emerald-500/90 text-emerald-950 hover:bg-emerald-400",
  adjust:
    "border border-amber-400/30 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
  reject:
    "border border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150",
        "disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
