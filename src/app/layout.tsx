import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'SaySEO — AI Visibility Platform for SEO Professionals',
    template: '%s | SaySEO',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: 'SEO platform',
  alternates: {
    canonical: siteConfig.url,
  },
  keywords: [
    'AI visibility',
    'SEO platform',
    'AI traffic attribution',
    'ChatGPT SEO',
    'Perplexity SEO',
    'GA4 integration',
    'Search Console integration',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: 'SaySEO — AI Visibility Platform for SEO Professionals',
    description: siteConfig.description,
    url: siteConfig.url,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaySEO — AI Visibility Platform for SEO Professionals',
    description: siteConfig.description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0A0A0A] text-white">{children}</body>
    </html>
  )
}
