'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { label: 'Reviews', href: '/reviews' },
  { label: 'Comparisons', href: '/comparisons' },
  { label: 'Best Tools', href: '/best-seo-tools' },
  { label: 'Free Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
]

export function AffiliateNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-[1.125rem] font-extrabold text-gray-900 tracking-tight leading-none">Say</span>
          <span className="text-[1.125rem] font-extrabold text-emerald-700 tracking-tight leading-none">SEO</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3.5 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-emerald-700 transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tools"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:border-emerald-600 hover:text-emerald-700 transition-colors duration-150"
          >
            Free Tools
          </Link>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors duration-150 whitespace-nowrap"
          >
            Browse Reviews
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-0.5 shadow-lg">
          {[...navLinks, { label: 'Browse Reviews', href: '/reviews' }].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-emerald-700 rounded-md transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
