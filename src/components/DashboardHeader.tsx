'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import SiteSwitcher from '@/components/SiteSwitcher'
import AddSiteModal from '@/components/AddSiteModal'
import AddSiteWizard from '@/components/AddSiteWizard'
import type { Site } from '@/lib/sites'

interface Props {
  sites: Site[]
  userEmail: string
}

export default function DashboardHeader({ sites, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [addSiteOpen, setAddSiteOpen] = useState(false)

  // Derive active siteId from URL: /dashboard/[siteId]/...
  const match = pathname.match(/^\/dashboard\/([^/]+)/)
  const activeSiteId = match?.[1] ?? ''

  function handleSiteAdded(newSiteId: string) {
    setAddSiteOpen(false)
    router.push(`/dashboard/${newSiteId}`)
  }

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 56,
          backgroundColor: '#0A0A0A',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          gap: '1rem',
        }}
      >
        {/* Left: logo + site switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Say</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#00D4AA', letterSpacing: '-0.03em' }}>SEO</span>
          </Link>

          {/* Only show the switcher when on a site-specific route */}
          {activeSiteId && (
            <SiteSwitcher
              sites={sites}
              activeSiteId={activeSiteId}
              onAddSite={() => setAddSiteOpen(true)}
            />
          )}
        </div>

        {/* Right: nav + email */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', flexShrink: 0 }}>
          <Link href="/dashboard/connect" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
            Connect
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.35)',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userEmail}
          </span>
        </nav>
      </header>

      <AddSiteWizard
        isOpen={addSiteOpen}
        onClose={() => setAddSiteOpen(false)}
        onSiteAdded={handleSiteAdded}
      />
    </>
  )
}
