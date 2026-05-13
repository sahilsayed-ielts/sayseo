import type { Metadata } from 'next'
import BlogPostClient from './BlogPostClient'

export const metadata: Metadata = {
  title: {
    absolute: 'How to Track if ChatGPT is Sending You Traffic | SaySEO Blog',
  },
  description:
    "ChatGPT is sending referral traffic to websites — but Google Analytics won't show you clearly. Here's exactly how to find it, measure it, and act on it.",
  alternates: {
    canonical: 'https://sayseo.co.uk/blog/how-to-track-chatgpt-traffic',
  },
  openGraph: {
    type: 'article',
    title: 'How to Track if ChatGPT is Sending You Traffic | SaySEO Blog',
    description:
      "ChatGPT is sending referral traffic to websites — but Google Analytics won't show you clearly. Here's exactly how to find it, measure it, and act on it.",
    url: 'https://sayseo.co.uk/blog/how-to-track-chatgpt-traffic',
    siteName: 'SaySEO',
    locale: 'en_GB',
    publishedTime: '2026-05-09',
    authors: ['SaySEO Team'],
    images: [
      {
        url: '/og/blog-chatgpt-traffic.png',
        width: 1200,
        height: 630,
        alt: 'Analytics dashboard showing ChatGPT traffic attribution',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Track if ChatGPT is Sending You Traffic | SaySEO Blog',
    description:
      "ChatGPT is sending referral traffic to websites — but Google Analytics won't show you clearly. Here's exactly how to find it, measure it, and act on it.",
    images: ['/og/blog-chatgpt-traffic.png'],
  },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Track if ChatGPT is Sending You Traffic',
  description:
    "ChatGPT is sending referral traffic to websites — but Google Analytics won't show you clearly. Here's exactly how to find it, measure it, and act on it.",
  url: 'https://sayseo.co.uk/blog/how-to-track-chatgpt-traffic',
  datePublished: '2026-05-09',
  dateModified: '2026-05-09',
  author: { '@type': 'Organization', name: 'SaySEO', url: 'https://sayseo.co.uk' },
  publisher: { '@type': 'Organization', name: 'SaySEO', url: 'https://sayseo.co.uk' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://sayseo.co.uk/blog/how-to-track-chatgpt-traffic' },
}

export default function HowToTrackChatGPTTrafficPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostClient />
    </>
  )
}
