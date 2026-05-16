import type { Metadata } from 'next'
import { Geist, Geist_Mono, Syne, DM_Sans } from 'next/font/google'
import { siteConfig } from '@/content/site'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const syne = Syne({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
})

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
    template: '%s | SaySEO',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: 'SEO reviews',
  alternates: {
    canonical: siteConfig.url,
  },
  keywords: [
    'SEO tools',
    'SEO software reviews',
    'best SEO tools',
    'Semrush review',
    'Ahrefs review',
    'keyword research tools',
    'backlink analysis tools',
    'SEO tool comparisons',
    'digital marketing tools',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
    description: siteConfig.description,
    url: siteConfig.url,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
    description: siteConfig.description,
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SaySEO',
  url: 'https://sayseo.co.uk',
  description: 'Independent SEO tool reviews, comparisons, and buying guides for SEO professionals and digital marketers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0A0A0A] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
