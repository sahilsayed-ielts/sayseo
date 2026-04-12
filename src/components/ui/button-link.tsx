import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "accent" | "dark-secondary";
  className?: string;
};

const variants = {
  primary:
    "bg-slate-950 text-stone-50 shadow-[0_18px_50px_rgba(13,24,48,0.22)] hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_24px_60px_rgba(13,24,48,0.28)]",
  secondary:
    "border border-slate-300/90 bg-white/90 text-slate-950 shadow-[0_12px_40px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white",
  accent:
    "bg-teal-700 text-white shadow-[0_18px_50px_rgba(15,118,110,0.24)] hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-[0_24px_60px_rgba(15,118,110,0.3)]",
  "dark-secondary":
    "border border-white/16 bg-white/6 text-white shadow-[0_12px_36px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/24",
  ghost: "text-slate-950 hover:text-teal-700",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  const sharedClassName = cn(
    "inline-flex min-h-13 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/60 focus-visible:ring-offset-2",
    variants[variant],
    className,
  );

  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={sharedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <a className={sharedClassName} href={href}>
      {children}
    </a>
  );
}
