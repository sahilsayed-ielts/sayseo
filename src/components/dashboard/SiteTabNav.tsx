'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SiteTabNav({ siteId }: { siteId: string }) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Overview', href: `/dashboard/${siteId}` },
    // { label: 'Citations', href: `/dashboard/${siteId}/citations` },
    { label: 'AI Overviews', href: `/dashboard/${siteId}/ai-overviews` },
    { label: 'Query Intel', href: `/dashboard/${siteId}/query-intelligence` },
    { label: 'GA4 Intel', href: `/dashboard/${siteId}/ga4-intel` },
    { label: 'Score', href: `/dashboard/${siteId}/score` },
    { label: 'Recommendations', href: `/dashboard/${siteId}/recommendations` },
    { label: 'Competitors', href: `/dashboard/${siteId}/competitors` },
  ]

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 1.5rem',
        display: 'flex',
        gap: 0,
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: active ? 700 : 500,
              color: active ? '#00D4AA' : 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              borderBottom: active ? '2px solid #00D4AA' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
