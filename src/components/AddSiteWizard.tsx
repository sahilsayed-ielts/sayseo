'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react'

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

function deriveDomain(str: string): string {
  return str
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

function IconCheck({ size = 14, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STEP_LABELS = ['GA4 Property', 'Search Console', 'Confirm']

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.25rem 1.5rem 0.25rem' }}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const done = step > num
        const active = step === num
        return (
          <Fragment key={label}>
            {i > 0 && (
              <div style={{
                width: 48,
                height: 2,
                flexShrink: 0,
                marginTop: 15,
                background: step > i ? '#00D4AA' : 'rgba(255,255,255,0.12)',
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: done ? '#00D4AA' : 'transparent',
                border: `2px solid ${done || active ? '#00D4AA' : 'rgba(255,255,255,0.18)'}`,
              }}>
                {done ? (
                  <IconCheck size={13} color="#0A0A0A" />
                ) : (
                  <span style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: active ? '#00D4AA' : 'rgba(255,255,255,0.3)',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>{num}</span>
                )}
              </div>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                color: active ? '#00D4AA' : done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
              }}>{label}</span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

function PermissionBadge({ level }: { level: string }) {
  const isOwner = level === 'siteOwner'
  const label = isOwner ? 'Owner' : level === 'siteFullUser' ? 'Full user' : 'Restricted'
  return (
    <span style={{
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      padding: '0.2rem 0.5rem',
      borderRadius: '0.3rem',
      background: isOwner ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.08)',
      color: isOwner ? '#00D4AA' : 'rgba(255,255,255,0.35)',
      flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

function AmberBox({ message }: { message: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.625rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      background: 'rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.25)',
      marginBottom: '0.75rem',
    }}>
      <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: '0.8rem', color: '#f59e0b', margin: 0, lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4AA]/50 focus:ring-1 focus:ring-[#00D4AA]/30 transition-colors'

const rowBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  gap: '0.75rem',
}

function NextBtn({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '0.625rem 1.25rem',
        borderRadius: '0.625rem',
        background: disabled ? 'rgba(255,255,255,0.08)' : '#00D4AA',
        color: disabled ? 'rgba(255,255,255,0.25)' : '#0A0A0A',
        fontSize: '0.875rem',
        fontWeight: 700,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      Next
    </button>
  )
}

function BackBtn({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.625rem 1.25rem',
        borderRadius: '0.625rem',
        background: 'transparent',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)',
        fontSize: '0.875rem',
        fontWeight: 600,
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      Back
    </button>
  )
}

export default function AddSiteWizard({ isOpen, onClose, onSiteAdded }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 — GA4
  const [ga4Properties, setGa4Properties] = useState<GA4Property[]>([])
  const [ga4Search, setGa4Search] = useState('')
  const [selectedGa4, setSelectedGa4] = useState<GA4Property | null>(null)
  const [manualGa4Id, setManualGa4Id] = useState('')
  const [loadingGa4, setLoadingGa4] = useState(false)
  const [ga4Error, setGa4Error] = useState<string | null>(null)

  // Step 2 — GSC
  const [gscSites, setGscSites] = useState<GSCSite[]>([])
  const [selectedGsc, setSelectedGsc] = useState<GSCSite | 'skip' | null>(null)
  const [loadingGsc, setLoadingGsc] = useState(false)
  const [gscError, setGscError] = useState<string | null>(null)
  const [suggestedGscUrl, setSuggestedGscUrl] = useState<string | null>(null)

  // Step 3 — Confirm
  const [domain, setDomain] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)

  // Reset state and fetch GA4 on open
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setGa4Properties([])
      setGa4Search('')
      setSelectedGa4(null)
      setManualGa4Id('')
      setLoadingGa4(false)
      setGa4Error(null)
      setGscSites([])
      setSelectedGsc(null)
      setLoadingGsc(false)
      setGscError(null)
      setSuggestedGscUrl(null)
      setDomain('')
      setSubmitting(false)
      setSubmitError(null)
      return
    }

    async function fetchGa4() {
      setLoadingGa4(true)
      setGa4Error(null)
      try {
        const res = await fetch('/api/sites/ga4-properties')
        const data = await res.json()
        if (Array.isArray(data.properties)) {
          setGa4Properties(data.properties)
        } else {
          setGa4Error(data.error ?? 'Could not load GA4 properties.')
        }
      } catch {
        setGa4Error('Could not load GA4 properties.')
      } finally {
        setLoadingGa4(false)
      }
    }

    fetchGa4()
  }, [isOpen])

  // Fetch GSC when entering step 2
  useEffect(() => {
    if (step !== 2 || !isOpen) return

    async function fetchGsc() {
      setLoadingGsc(true)
      setGscError(null)
      try {
        const res = await fetch('/api/sites/gsc-sites')
        const data = await res.json()
        if (Array.isArray(data.sites)) {
          setGscSites(data.sites)
          const ga4Domain = deriveDomain(selectedGa4?.displayName ?? '')
          if (ga4Domain) {
            const suggested = (data.sites as GSCSite[]).find((s) => {
              const gscDomain = deriveDomain(s.siteUrl)
              return gscDomain.includes(ga4Domain) || ga4Domain.includes(gscDomain)
            })
            if (suggested) {
              setSuggestedGscUrl(suggested.siteUrl)
              setSelectedGsc(suggested)
            }
          }
        } else {
          setGscError(data.error ?? 'Could not load Search Console sites.')
        }
      } catch {
        setGscError('Could not load Search Console sites.')
      } finally {
        setLoadingGsc(false)
      }
    }

    fetchGsc()
  }, [step, isOpen, selectedGa4])

  // Derive domain when entering step 3
  useEffect(() => {
    if (step !== 3) return
    if (selectedGsc && selectedGsc !== 'skip') {
      setDomain(deriveDomain(selectedGsc.siteUrl))
    } else if (selectedGa4) {
      setDomain(deriveDomain(selectedGa4.displayName))
    }
  }, [step, selectedGsc, selectedGa4])

  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  // Focus trap
  function handleTabTrap(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !modalRef.current) return
    const focusable = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'))
    if (!focusable.length) return
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

  // Filtered + grouped GA4 properties
  const filteredGroups = useMemo(() => {
    const query = ga4Search.trim().toLowerCase()
    const filtered = query
      ? ga4Properties.filter(
          (p) =>
            p.displayName.toLowerCase().includes(query) ||
            p.propertyId.includes(query) ||
            p.accountName.toLowerCase().includes(query)
        )
      : ga4Properties
    const groups: Record<string, GA4Property[]> = {}
    for (const p of filtered) {
      if (!groups[p.accountName]) groups[p.accountName] = []
      groups[p.accountName].push(p)
    }
    return groups
  }, [ga4Properties, ga4Search])

  const canNext1 = selectedGa4 !== null || manualGa4Id.trim() !== ''
  const canNext2 = selectedGsc !== null
  const canSubmit = domain.trim() !== ''

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const ga4Id = selectedGa4?.propertyId ?? (manualGa4Id.trim() || undefined)
      const gscUrl = selectedGsc && selectedGsc !== 'skip' ? selectedGsc.siteUrl : undefined
      const res = await fetch('/api/sites/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), ga4_property_id: ga4Id, gsc_site_url: gscUrl }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSubmitError(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      onSiteAdded(json.siteId)
      onClose()
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  // ─── Shared list container style ─────────────────────────────────────────────
  const listContainer: React.CSSProperties = {
    maxHeight: 280,
    overflowY: 'auto',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#111',
  }

  // ─── Step 1: GA4 Property ────────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>
          Select a GA4 Property
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Choose the Google Analytics 4 property for this site.
        </p>
      </div>

      <div style={{ padding: '0 1.5rem 0.75rem' }}>
        {loadingGa4 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ height: 52, borderRadius: '0.625rem', background: 'rgba(255,255,255,0.06)' }}
              />
            ))}
          </div>
        ) : ga4Error ? (
          <>
            <AmberBox message={ga4Error} />
            <input
              type="text"
              value={manualGa4Id}
              onChange={(e) => setManualGa4Id(e.target.value)}
              placeholder="Enter GA4 Property ID manually"
              autoComplete="off"
              className={inputCls}
            />
          </>
        ) : ga4Properties.length === 0 ? (
          <>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '1rem 0 0.75rem', margin: 0 }}>
              No GA4 properties found.
            </p>
            <input
              type="text"
              value={manualGa4Id}
              onChange={(e) => setManualGa4Id(e.target.value)}
              placeholder="Enter GA4 Property ID manually"
              autoComplete="off"
              className={inputCls}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              value={ga4Search}
              onChange={(e) => setGa4Search(e.target.value)}
              placeholder="Search properties..."
              autoComplete="off"
              className={inputCls}
              style={{ marginBottom: '0.625rem' }}
            />
            <div style={listContainer}>
              {Object.entries(filteredGroups).length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', padding: '1rem', textAlign: 'center', margin: 0 }}>
                  No properties match your search.
                </p>
              ) : (
                Object.entries(filteredGroups).map(([accountName, props], groupIdx) => (
                  <div key={accountName}>
                    <div style={{
                      padding: '0.5rem 1rem 0.25rem',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.25)',
                      borderTop: groupIdx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}>
                      {accountName}
                    </div>
                    {props.map((p) => {
                      const selected = selectedGa4?.propertyId === p.propertyId
                      return (
                        <div
                          key={p.propertyId}
                          onClick={() => setSelectedGa4(p)}
                          onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,170,0.04)' }}
                          onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                          style={{
                            ...rowBase,
                            borderLeft: selected ? '3px solid #00D4AA' : '3px solid transparent',
                            background: selected ? 'rgba(0,212,170,0.08)' : 'transparent',
                            paddingLeft: selected ? 'calc(1rem - 3px)' : '1rem',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.displayName}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: '0.125rem 0 0', lineHeight: 1 }}>
                              {p.propertyId}
                            </p>
                          </div>
                          {selected && <IconCheck size={14} color="#00D4AA" />}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1.5rem 1.5rem' }}>
        <NextBtn disabled={!canNext1 || loadingGa4} onClick={() => setStep(2)} />
      </div>
    </>
  )

  // ─── Step 2: Search Console ──────────────────────────────────────────────────
  const renderStep2 = () => {
    const skipSelected = selectedGsc === 'skip'
    return (
      <>
        <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>
            Match your Search Console Site
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Select the Google Search Console property for this site.
          </p>
        </div>

        <div style={{ padding: '0 1.5rem 0.75rem' }}>
          {loadingGsc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ height: 44, borderRadius: '0.625rem', background: 'rgba(255,255,255,0.06)' }}
                />
              ))}
            </div>
          ) : (
            <>
              {gscError && <AmberBox message={gscError} />}
              <div style={listContainer}>
                {!gscError && gscSites.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', padding: '1rem', textAlign: 'center', margin: 0 }}>
                    No Search Console sites found.
                  </p>
                )}
                {gscSites.map((s, idx) => {
                  const selected = selectedGsc !== 'skip' && (selectedGsc as GSCSite | null)?.siteUrl === s.siteUrl
                  const isSuggested = s.siteUrl === suggestedGscUrl
                  return (
                    <div
                      key={s.siteUrl}
                      onClick={() => setSelectedGsc(s)}
                      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,170,0.04)' }}
                      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                      style={{
                        ...rowBase,
                        borderLeft: selected ? '3px solid #00D4AA' : '3px solid transparent',
                        background: selected ? 'rgba(0,212,170,0.08)' : 'transparent',
                        paddingLeft: selected ? 'calc(1rem - 3px)' : '1rem',
                        borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.siteUrl}
                        </span>
                        {isSuggested && (
                          <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '0.3rem',
                            background: 'rgba(0,212,170,0.15)',
                            color: '#00D4AA',
                            flexShrink: 0,
                          }}>Suggested</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <PermissionBadge level={s.permissionLevel} />
                        {selected && <IconCheck size={14} color="#00D4AA" />}
                      </div>
                    </div>
                  )
                })}
                {/* None / skip */}
                <div
                  onClick={() => setSelectedGsc('skip')}
                  onMouseEnter={(e) => { if (!skipSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={(e) => { if (!skipSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  style={{
                    ...rowBase,
                    borderLeft: skipSelected ? '3px solid #00D4AA' : '3px solid transparent',
                    background: skipSelected ? 'rgba(0,212,170,0.08)' : 'transparent',
                    paddingLeft: skipSelected ? 'calc(1rem - 3px)' : '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>None / skip</span>
                  {skipSelected && <IconCheck size={14} color="#00D4AA" />}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.5rem 1.5rem' }}>
          <BackBtn onClick={() => setStep(1)} />
          <NextBtn disabled={!canNext2 || loadingGsc} onClick={() => setStep(3)} />
        </div>
      </>
    )
  }

  // ─── Step 3: Confirm ─────────────────────────────────────────────────────────
  const renderStep3 = () => {
    const ga4Label = selectedGa4
      ? `${selectedGa4.displayName} (${selectedGa4.propertyId})`
      : manualGa4Id.trim() || '—'
    const gscLabel =
      selectedGsc && selectedGsc !== 'skip' ? (selectedGsc as GSCSite).siteUrl : 'Not connected'
    const summaryRows = [
      { label: 'Domain', value: domain || '—' },
      { label: 'GA4 Property', value: ga4Label },
      { label: 'Search Console', value: gscLabel },
    ]
    return (
      <>
        <div style={{ padding: '1.25rem 1.5rem 0.75rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>
            Confirm Site Details
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Review your details before adding.
          </p>
        </div>

        <div style={{ padding: '0 1.5rem 0.75rem' }}>
          {/* Summary card */}
          <div style={{
            border: '1px solid rgba(0,212,170,0.2)',
            borderRadius: '0.75rem',
            background: 'rgba(0,212,170,0.03)',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}>
            {summaryRows.map((row, i) => (
              <div key={row.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0, paddingTop: 1 }}>{row.label}</span>
                <span style={{ fontSize: '0.8rem', color: '#fff', textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Editable domain */}
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.375rem' }}>
            Domain <span style={{ color: '#00D4AA' }}>*</span>
          </label>
          <input
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

          {/* Submit error */}
          {submitError && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              marginTop: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}>
              <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: '0.8rem', color: '#f87171', margin: 0, lineHeight: 1.5 }}>{submitError}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.5rem 1.5rem' }}>
          <BackBtn onClick={() => { setStep(2); setSubmitError(null) }} disabled={submitting} />
          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.625rem',
              background: canSubmit && !submitting ? '#00D4AA' : 'rgba(255,255,255,0.08)',
              color: canSubmit && !submitting ? '#0A0A0A' : 'rgba(255,255,255,0.25)',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            ) : (
              'Add Site'
            )}
          </button>
        </div>
      </>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="wizard-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={modalRef}
        onKeyDown={handleTabTrap}
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: '1rem',
          background: '#0A0A0A',
          border: '1px solid rgba(0,212,170,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 0' }}>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#00D4AA', margin: '0 0 3px' }}>
              Sites
            </p>
            <h2 id="wizard-title" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Add a New Site
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <StepIndicator step={step} />

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1rem 0 0' }} />

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  )
}
