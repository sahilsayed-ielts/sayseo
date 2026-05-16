'use client'

import Link from 'next/link'
import { useState } from 'react'

export function AffiliateNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 no-underline">
          <span className="text-[1.1875rem] font-extrabold text-white tracking-tight leading-none">Say</span>
          <span className="text-[1.1875rem] font-extrabold text-[#00D4AA] tracking-tight leading-none">SEO</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
          {[
            { label: 'Reviews', href: '/reviews' },
            { label: 'Comparisons', href: '/comparisons' },
            { label: 'Best Lists', href: '/best-seo-tools' },
            { label: 'Blog', href: '/blog' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="hover:text-white/90 transition-colors duration-150">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/app"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white/60 border border-white/[0.14] hover:border-white/25 hover:text-white/90 transition-colors duration-150"
          >
            Free SEO Tools
          </Link>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity duration-150 whitespace-nowrap"
          >
            Browse Reviews
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/50 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen
                ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                : <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0A0A0A] px-6 py-4 flex flex-col gap-3">
          {[
            { label: 'Reviews', href: '/reviews' },
            { label: 'Comparisons', href: '/comparisons' },
            { label: 'Best Lists', href: '/best-seo-tools' },
            { label: 'Blog', href: '/blog' },
            { label: 'Free SEO Tools', href: '/app' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-white/60 hover:text-white transition-colors py-1"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
