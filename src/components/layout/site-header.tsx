import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { navigation } from "@/content/site";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/78 px-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full pr-2 transition hover:opacity-95"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-stone-50 shadow-[0_12px_30px_rgba(13,24,48,0.22)]">
            SS
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              sayseo.com
            </p>
            <p className="text-sm text-slate-600">
              Senior SEO consultancy for UK and India
            </p>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-2 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-950/4 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/60"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink
            href="/contact"
            variant="accent"
            className="ml-2 min-h-12 px-5 py-3 shadow-[0_18px_50px_rgba(15,118,110,0.2)]"
          >
            Book a strategy call
          </ButtonLink>
        </nav>

        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
