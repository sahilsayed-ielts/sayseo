"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/content/site";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
      >
        <span className="sr-only">Toggle navigation</span>
        <span className="space-y-1.5">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-16 z-50">
          <div id="mobile-navigation" className="surface p-5">
            <div className="mb-4 rounded-[1.5rem] bg-slate-950 px-4 py-4 text-stone-50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
                sayseo.com
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Premium advisory-led SEO for businesses across the UK and India.
              </p>
            </div>

            <nav aria-label="Mobile" className="flex flex-col gap-2">
              {navigation.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-base font-medium transition ${
                      active
                        ? "bg-slate-950 text-stone-50"
                        : "text-slate-700 hover:bg-stone-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-full bg-teal-700 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.2)] transition hover:bg-teal-800"
              >
                Book a strategy call
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
