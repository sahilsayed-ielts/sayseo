'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Site } from '@/lib/sites'

interface Props {
  sites: Site[]
  activeSiteId: string
  onAddSite: () => void
}

export default function SiteSwitcher({ sites, activeSiteId, onAddSite }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeSite = sites.find((s) => s.id === activeSiteId)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white/80 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all"
      >
        <span className="max-w-[160px] truncate">
          {activeSite?.domain ?? 'Select site'}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-white/40 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[220px] rounded-xl bg-[#0F0F0F] border border-white/10 shadow-xl overflow-hidden">
          {sites.length === 0 ? (
            <p className="px-4 py-3 text-xs text-white/30">No sites connected yet.</p>
          ) : (
            <ul>
              {sites.map((site) => {
                const isActive = site.id === activeSiteId
                return (
                  <li key={site.id}>
                    <Link
                      href={`/dashboard/${site.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'text-white bg-white/5'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {/* Active dot */}
                      <span className="flex-shrink-0 w-4 flex items-center justify-center">
                        {isActive && (
                          <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true">
                            <circle cx="3.5" cy="3.5" r="3.5" fill="#00D4AA" />
                          </svg>
                        )}
                      </span>
                      <span className="truncate">{site.domain}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Add site */}
          <button
            onClick={() => {
              setOpen(false)
              onAddSite()
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-white/50 hover:text-[#00D4AA] hover:bg-white/5 transition-colors"
          >
            <span className="flex-shrink-0 w-4 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Add Site
          </button>
        </div>
      )}
    </div>
  )
}
