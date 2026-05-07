'use client'

import { useState } from 'react'
import type { PageEntry } from './types'
import { sourceColor } from './types'

type SortKey = 'totalAiSessions' | 'share'
type SortDir = 'asc' | 'desc'

export default function TopPagesTable({
  pages,
  totalAiSessions,
}: {
  pages: PageEntry[]
  totalAiSessions: number
}) {
  const [sortKey, setSortKey] = useState<SortKey>('totalAiSessions')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [visible, setVisible] = useState(20)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const withShare = pages.map((p) => ({
    ...p,
    share: totalAiSessions > 0 ? (p.totalAiSessions / totalAiSessions) * 100 : 0,
    topSource: p.sources[0],
  }))

  const sorted = [...withShare].sort((a, b) => {
    const aVal = sortKey === 'share' ? a.share : a.totalAiSessions
    const bVal = sortKey === 'share' ? b.share : b.totalAiSessions
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal
  })

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === col ? 1 : 0.3, fontSize: '0.7rem' }}>
      {sortKey === col && sortDir === 'asc' ? '↑' : '↓'}
    </span>
  )

  const thStyle: React.CSSProperties = {
    padding: '0.625rem 1rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  }

  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
          Top AI-Referenced Pages
        </h2>
      </div>

      {pages.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', padding: '2rem 1.5rem', margin: 0 }}>
          No pages with AI traffic detected yet.
        </p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ ...thStyle, cursor: 'default' }}>Page URL</th>
                  <th style={{ ...thStyle, cursor: 'default' }}>Top AI Source</th>
                  <th style={thStyle} onClick={() => handleSort('totalAiSessions')}>
                    AI Sessions <SortIcon col="totalAiSessions" />
                  </th>
                  <th style={thStyle} onClick={() => handleSort('share')}>
                    Share of AI Traffic <SortIcon col="share" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, visible).map((page, i) => {
                  const color = sourceColor(page.topSource?.name ?? '', 0)
                  return (
                    <tr
                      key={page.url}
                      style={{
                        borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
                    >
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          fontSize: '0.8rem',
                          color: '#fff',
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={page.url}
                      >
                        {page.url}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {page.topSource ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color,
                              backgroundColor: `${color}18`,
                              borderRadius: 4,
                              padding: '2px 8px',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
                            {page.topSource.name}
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        {page.totalAiSessions.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(page.share, 100)}%`,
                                backgroundColor: '#00D4AA',
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                            {page.share.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {sorted.length > visible && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <button
                onClick={() => setVisible((v) => v + 20)}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#00D4AA',
                  backgroundColor: 'rgba(0,212,170,0.1)',
                  border: '1px solid rgba(0,212,170,0.25)',
                  cursor: 'pointer',
                }}
              >
                Load more ({sorted.length - visible} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
