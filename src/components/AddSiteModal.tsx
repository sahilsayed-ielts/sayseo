'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface GA4Property {
  propertyId: string
  displayName: string
  accountName: string
}

interface GSCSite {
  siteUrl: string
  permissionLevel: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSiteAdded: (newSiteId: string) => void
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-colors'

const selectCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-[#111] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-colors appearance-none cursor-pointer'

function deriveDomain(siteUrl: string): string {
  return siteUrl
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

function ChevronDown() {
  return (
    <svg
      className="w-3.5 h-3.5 text-white/30 pointer-events-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AddSiteModal({ isOpen, onClose, onSiteAdded }: Props) {
  const [domain, setDomain] = useState('')
  const [ga4PropertyId, setGa4PropertyId] = useState('')
  const [gscSiteUrl, setGscSiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [ga4Properties, setGa4Properties] = useState<GA4Property[]>([])
  const [gscSites, setGscSites] = useState<GSCSite[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [propertiesError, setPropertiesError] = useState<string | null>(null)

  const firstInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus first input when modal opens; reset state and fetch Google data on open
  useEffect(() => {
    if (!isOpen) {
      setDomain('')
      setGa4PropertyId('')
      setGscSiteUrl('')
      setError(null)
      setGa4Properties([])
      setGscSites([])
      setLoadingProperties(false)
      setPropertiesError(null)
      return
    }

    setTimeout(() => firstInputRef.current?.focus(), 50)

    async function fetchGoogleData() {
      setLoadingProperties(true)
      setPropertiesError(null)
      try {
        const [ga4Res, gscRes] = await Promise.all([
          fetch('/api/sites/ga4-properties'),
          fetch('/api/sites/gsc-sites'),
        ])
        const [ga4Data, gscData] = await Promise.all([ga4Res.json(), gscRes.json()])

        console.log('ga4 response status:', ga4Res.status, 'ok:', ga4Res.ok)
        console.log('ga4 data:', JSON.stringify(ga4Data))

        if (Array.isArray(ga4Data.properties)) {
          setGa4Properties(ga4Data.properties)
        }
        if (gscRes.ok && Array.isArray(gscData.sites)) {
          setGscSites(gscData.sites)
        }
        if (!ga4Res.ok && !gscRes.ok) {
          setPropertiesError('Could not load Google data. Enter values manually below.')
        }
      } catch {
        setPropertiesError('Could not load Google data. Enter values manually below.')
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchGoogleData()
  }, [isOpen])

  // ESC key closes modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  // Focus trap: keep Tab / Shift+Tab inside the modal
  function handleTabTrap(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !modalRef.current) return
    const focusable = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'))
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function handleGscChange(url: string) {
    setGscSiteUrl(url)
    if (url) setDomain(deriveDomain(url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/sites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          ga4_property_id: ga4PropertyId || undefined,
          gsc_site_url: gscSiteUrl || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      onSiteAdded(json.siteId)
      onClose()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const showGa4Dropdown = loadingProperties || ga4Properties.length > 0
  const showGscDropdown = loadingProperties || gscSites.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-site-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={modalRef}
        onKeyDown={handleTabTrap}
        className="w-full max-w-md rounded-2xl bg-[#0A0A0A] border border-[#00D4AA]/25 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-0.5">
              Sites
            </p>
            <h2 id="add-site-title" className="text-lg font-extrabold text-white tracking-tight">
              Add a New Site
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-5">

            {/* Domain */}
            <div>
              <label htmlFor="modal-domain" className="block text-xs font-semibold text-white/60 mb-1.5">
                Domain <span className="text-[#00D4AA]">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="modal-domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onBlur={(e) => setDomain(deriveDomain(e.target.value))}
                placeholder="example.com"
                required
                autoComplete="off"
                spellCheck={false}
                className={inputCls}
              />
            </div>

            {/* GA4 Property */}
            <div>
              <label htmlFor="modal-ga4" className="block text-xs font-semibold text-white/60 mb-1.5">
                GA4 Property
                <span className="ml-1 font-normal text-white/30">(optional)</span>
              </label>

              {showGa4Dropdown ? (
                <div className="relative">
                  <select
                    id="modal-ga4"
                    value={ga4PropertyId}
                    onChange={(e) => setGa4PropertyId(e.target.value)}
                    disabled={loadingProperties}
                    className={`${selectCls} ${loadingProperties ? 'opacity-40 animate-pulse' : ''}`}
                    style={{ backgroundColor: '#111' }}
                  >
                    {loadingProperties ? (
                      <option value="">Loading properties…</option>
                    ) : (
                      <>
                        <option value="">None / skip</option>
                        {ga4Properties.map((p) => (
                          <option key={p.propertyId} value={p.propertyId} style={{ backgroundColor: '#111' }}>
                            {p.displayName} — {p.accountName}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <ChevronDown />
                  </div>
                </div>
              ) : (
                <input
                  id="modal-ga4"
                  type="text"
                  value={ga4PropertyId}
                  onChange={(e) => setGa4PropertyId(e.target.value)}
                  placeholder="Enter GA4 Property ID manually"
                  autoComplete="off"
                  className={inputCls}
                />
              )}

              {!loadingProperties && ga4Properties.length === 0 && !propertiesError && (
                <p className="mt-1.5 text-xs text-white/25">
                  Found in GA4 Admin &rsaquo; Property Settings
                </p>
              )}
            </div>

            {/* GSC Site URL */}
            <div>
              <label htmlFor="modal-gsc" className="block text-xs font-semibold text-white/60 mb-1.5">
                GSC Site URL
                <span className="ml-1 font-normal text-white/30">(optional)</span>
              </label>

              {showGscDropdown ? (
                <div className="relative">
                  <select
                    id="modal-gsc"
                    value={gscSiteUrl}
                    onChange={(e) => handleGscChange(e.target.value)}
                    disabled={loadingProperties}
                    className={`${selectCls} ${loadingProperties ? 'opacity-40 animate-pulse' : ''}`}
                    style={{ backgroundColor: '#111' }}
                  >
                    {loadingProperties ? (
                      <option value="">Loading sites…</option>
                    ) : (
                      <>
                        <option value="">None / skip</option>
                        {gscSites.map((s) => (
                          <option key={s.siteUrl} value={s.siteUrl} style={{ backgroundColor: '#111' }}>
                            {s.siteUrl}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <ChevronDown />
                  </div>
                </div>
              ) : (
                <input
                  id="modal-gsc"
                  type="text"
                  value={gscSiteUrl}
                  onChange={(e) => handleGscChange(e.target.value)}
                  placeholder="Enter GSC Site URL manually"
                  autoComplete="off"
                  spellCheck={false}
                  className={inputCls}
                />
              )}

              {!loadingProperties && gscSites.length > 0 && (
                <p className="mt-1.5 text-xs text-white/25">
                  Selecting a site will auto-fill the domain above.
                </p>
              )}
              {!loadingProperties && gscSites.length === 0 && !propertiesError && (
                <p className="mt-1.5 text-xs text-white/25">
                  Found in Google Search Console property list
                </p>
              )}
            </div>

            {/* Non-blocking notice when Google data couldn't be loaded */}
            {propertiesError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-amber-400">{propertiesError}</p>
              </div>
            )}

            {/* Submit error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !domain.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D4AA] text-sm font-bold text-[#0A0A0A] hover:bg-[#00BF99] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Add Site'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
