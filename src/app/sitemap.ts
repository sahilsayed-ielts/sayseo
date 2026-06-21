import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import type { MetadataRoute } from 'next'
import { generateStaticParams as generateAlternativeParams } from './alternatives/[slug]/page'
import { generateStaticParams as generateComparisonParams } from './comparisons/[slug]/page'
import { generateStaticParams as generatePricingParams } from './pricing/[slug]/page'
import { generateStaticParams as generateReviewParams } from './reviews/[slug]/page'

const BASE = 'https://sayseo.co.uk'
const LAST_MOD = '2026-05-20'

async function getBlogSlugs() {
  const blogDir = path.join(process.cwd(), 'src/app/blog')
  const entries = await readdir(blogDir, { withFileTypes: true })

  const blogSlugs = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const pagePath = path.join(blogDir, entry.name, 'page.tsx')

        try {
          await access(pagePath)
          return entry.name
        } catch {
          return null
        }
      }),
  )

  return blogSlugs.filter((slug): slug is string => Boolean(slug))
}

function pageEntry(
  pathname: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>,
  priority: number,
  lastModified = LAST_MOD,
) {
  return {
    url: `${BASE}${pathname}`,
    lastModified,
    changeFrequency,
    priority,
  } satisfies MetadataRoute.Sitemap[number]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const alternativeSlugs = generateAlternativeParams().map(({ slug }) => slug)
  const reviewSlugs = generateReviewParams().map(({ slug }) => slug)
  const comparisonSlugs = generateComparisonParams().map(({ slug }) => slug)
  const pricingSlugs = generatePricingParams().map(({ slug }) => slug)
  const blogSlugs = await getBlogSlugs()

  return [
    pageEntry('/', 'weekly', 1.0),
    pageEntry('/reviews', 'weekly', 0.9),
    pageEntry('/comparisons', 'weekly', 0.9),
    pageEntry('/best-seo-tools', 'weekly', 0.85),
    pageEntry('/tools', 'weekly', 0.88),
    pageEntry('/tools/serp-preview', 'monthly', 0.82),
    pageEntry('/tools/title-tag-analyzer', 'monthly', 0.82),
    pageEntry('/tools/schema-generator', 'monthly', 0.82),
    pageEntry('/tools/keyword-density', 'monthly', 0.82),
    pageEntry('/tools/seo-roi-calculator', 'monthly', 0.82),
    pageEntry('/tools/robots-txt-generator', 'monthly', 0.82),
    pageEntry('/blog', 'weekly', 0.8),
    pageEntry('/affiliate-disclosure', 'yearly', 0.4),
    pageEntry('/app', 'weekly', 0.75),
    ...alternativeSlugs.map((slug) => pageEntry(`/alternatives/${slug}`, 'monthly', 0.78)),
    ...pricingSlugs.map((slug) => pageEntry(`/pricing/${slug}`, 'monthly', 0.8)),
    ...reviewSlugs.map((slug) => pageEntry(`/reviews/${slug}`, 'monthly', 0.75)),
    ...comparisonSlugs.map((slug) => pageEntry(`/comparisons/${slug}`, 'monthly', 0.75)),
    ...blogSlugs.map((slug) => pageEntry(`/blog/${slug}`, 'monthly', 0.7)),
  ]
}
