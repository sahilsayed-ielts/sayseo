import type { MetadataRoute } from 'next'

const BASE = 'https://sayseo.co.uk'
const LAST_MOD = '2026-05-10'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`,                                           lastModified: LAST_MOD, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/blog`,                                       lastModified: LAST_MOD, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog/how-to-track-chatgpt-traffic`,          lastModified: '2026-05-09', changeFrequency: 'monthly', priority: 0.7 },
  ]
}
