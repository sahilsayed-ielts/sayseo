# SaySEO — Affiliate Content Strategy

## Current state

### Progress tracker

**Completed:**
- `/comparisons/[slug]` route built for the 6 existing comparison slugs
- FAQ sections + `FAQPage` JSON-LD added to comparison detail pages
- `Review` JSON-LD and `FAQPage` JSON-LD added to all existing review pages
- Category filter chips on `/reviews` made functional via URL params
- `/affiliate-disclosure` page added and linked from the affiliate footer
- `src/app/sitemap.ts` updated to enumerate review, comparison, and existing blog slugs dynamically
- `/alternatives/[slug]` route built with the first 5 priority pages: `semrush`, `ahrefs`, `moz`, `screaming-frog`, `surfer-seo`
- `/pricing/[slug]` route built with the first 4 priority pages: `semrush`, `ahrefs`, `moz-pro`, `se-ranking`

**Pending:**
- Add coupon/deal pages
- Add use-case landing pages
- Add email capture form
- Expand tool review coverage with the next priority tools

**What exists:**
- 8 individual tool reviews: Semrush, Ahrefs, SE Ranking, Surfer SEO, Screaming Frog, Moz Pro, Mangools, SpyFu
- Reviews index (`/reviews`), comparison index (`/comparisons`), 6 comparison detail pages, best-of page (`/best-seo-tools`), 1 blog post
- Own SaySEO AI tool promoted inline on homepage
- All review data is hardcoded in `src/app/reviews/[slug]/page.tsx`

**Blocking issues:**
- No `/alternatives/[tool]` pages (highest-converting affiliate content type)
- No `/pricing/[tool]` pages (very high purchase-intent search volume)
- No coupon/deal pages
- No use-case landing pages
- No email capture form (only a teaser card linking to blog)

---

## Content architecture

### Tier 1 — Money pages (build first)

#### A. Comparison detail pages
Route: `src/app/comparisons/[slug]/page.tsx`

Build `generateStaticParams` + page component following the same pattern as `src/app/reviews/[slug]/page.tsx`.

Slugs to build (6 already listed in `/comparisons` index):
- `semrush-vs-ahrefs`
- `se-ranking-vs-semrush`
- `ahrefs-vs-moz`
- `surfer-vs-semrush`
- `screaming-frog-vs-semrush`
- `mangools-vs-se-ranking`

Additional comparisons to add:
- `yoast-vs-rank-math`
- `surfer-vs-clearscope`
- `surfer-vs-frase`
- `semrush-vs-moz`
- `ahrefs-vs-ubersuggest`
- `se-ranking-vs-mangools`
- `brightlocal-vs-whitespark`

Each comparison page needs:
1. Hero with "Tool A vs Tool B" H1
2. Quick verdict summary card (who wins and why)
3. Side-by-side feature comparison table
4. Side-by-side pricing table
5. "Who should pick Tool A" section with affiliate CTA
6. "Who should pick Tool B" section with affiliate CTA
7. Overall winner verdict with nuance (both tools should win something)
8. FAQ section (5 Q&As minimum)
9. `application/ld+json` with `@type: FAQPage` schema

#### B. Alternatives pages
Route: `src/app/alternatives/[slug]/page.tsx`

New route group. Captures users already on a tool who are considering switching — very high purchase intent.

Slugs to build (priority order):
1. `semrush` — "semrush alternatives" ~6k/mo
2. `ahrefs` — "ahrefs alternatives" ~5k/mo
3. `moz` — "moz alternatives" ~3k/mo
4. `screaming-frog` — ~2k/mo
5. `surfer-seo` — ~1.8k/mo
6. `spyfu` — ~1.5k/mo
7. `majestic` — ~1.2k/mo

Each page structure:
1. H1: "Best [Tool] Alternatives in 2026"
2. Intro: when to switch, what to look for
3. List of 5–7 alternatives with mini-review (150–200 words each), rating, price, affiliate CTA
4. Comparison table: alternatives vs original tool
5. "Best [Tool] Alternative for X" quick-pick section
6. FAQ schema

#### C. Pricing pages
Route: `src/app/pricing/[slug]/page.tsx`

Slugs to build (priority order):
1. `semrush` — ~12k/mo
2. `ahrefs` — ~8k/mo
3. `moz-pro` — ~3.5k/mo
4. `se-ranking` — ~2.5k/mo
5. `surfer-seo` — ~2k/mo
6. `mangools` — ~1.5k/mo

Each page structure:
1. H1: "[Tool] Pricing 2026 — All Plans Explained"
2. Plan breakdown table (expand from what's on review pages)
3. "Which plan should I choose?" decision guide
4. Annual vs monthly savings callout
5. Current free trial / promotional offer
6. Affiliate CTA per plan tier
7. FAQ schema

#### D. Coupon / deal pages
Route: `src/app/deals/[slug]/page.tsx`

Slugs (priority order):
1. `semrush` — "semrush promo code" ~9k/mo
2. `ahrefs` — "ahrefs discount" ~4k/mo
3. `moz-pro` — ~2k/mo
4. `se-ranking` — ~1.5k/mo
5. `surfer-seo` — ~1.2k/mo
6. `mangools` — ~1k/mo

Each page structure:
1. H1: "[Tool] Discount Codes & Deals — [Month] 2026"
2. Active deals section (free trial, annual plan savings, current promo)
3. "How to claim" step-by-step
4. Affiliate CTA (the link IS the deal)
5. FAQ: "Does [Tool] offer a free trial?", "Is there a student discount?", etc.

### Tier 2 — Use-case landing pages

Route: `src/app/best-seo-tools/[use-case]/page.tsx` OR new slugs added to `generateStaticParams` in existing best-seo-tools page.

Use cases to build (priority order):
1. `for-bloggers` — "best SEO tools for bloggers" ~5k/mo
2. `free` — "best free SEO tools" ~18k/mo
3. `for-small-business` — ~4k/mo
4. `for-agencies` — ~3.5k/mo
5. `for-freelancers` — ~2.5k/mo
6. `ai-seo-tools` — "best AI SEO tools" ~6k/mo
7. `for-beginners` — ~3k/mo
8. `local-seo` — ~2.8k/mo
9. `keyword-research` — ~8k/mo (expands existing category section)
10. `rank-tracking` — ~3.5k/mo
11. `backlink-checker` — ~4k/mo
12. `content-optimization` — ~2k/mo
13. `technical-seo` — ~3k/mo
14. `for-ecommerce` — ~2.2k/mo

### Tier 3 — Blog content clusters

Route: `src/app/blog/[slug]/page.tsx` (extend existing pattern in `src/app/blog/how-to-track-chatgpt-traffic/`)

**Cluster 1: AI Search & SEO (unique editorial angle — build first)**
- `how-to-rank-in-ai-overviews` — pillar post
- `chatgpt-seo-optimisation`
- `perplexity-seo-guide`
- `ai-overview-click-through-rates`
- `how-to-get-cited-by-ai`
- `ai-vs-google-traffic-comparison`

**Cluster 2: Keyword Research**
- `keyword-research-guide-2026` — pillar post
- `low-competition-keywords`
- `long-tail-keyword-strategy`
- `keyword-difficulty-explained`
- `competitor-keyword-research`

**Cluster 3: Technical SEO**
- `technical-seo-audit-checklist` — pillar post
- `core-web-vitals-guide`
- `fix-crawl-errors-search-console`
- `javascript-seo-guide`

**Cluster 4: Tool tutorials (rank for "[tool] tutorial" and convert to affiliate)**
- `how-to-use-semrush-keyword-research`
- `screaming-frog-site-audit-guide`
- `ahrefs-rank-tracker-setup`
- `surfer-seo-content-editor-guide`

---

## Technical tasks

### Must-fix before publishing new content

1. **Comparison routes** — build `src/app/comparisons/[slug]/page.tsx` — done
2. **Review structured data** — add `@type: Review` JSON-LD to `src/app/reviews/[slug]/page.tsx` — done
   - Required fields: `itemReviewed` (SoftwareApplication), `reviewRating`, `author`, `datePublished`, `publisher`
3. **FAQPage schema** — add FAQ sections + `@type: FAQPage` JSON-LD to reviews and comparisons — done
4. **Sitemap** — update `src/app/sitemap.ts` to enumerate all review slugs, comparison slugs, blog slugs dynamically — done
5. **Reviews filter** — make category chips functional (client-side state or URL params) — done
6. **Affiliate disclosure page** — `src/app/affiliate-disclosure/page.tsx` — done
7. **Email capture** — replace newsletter teaser card with a real form (Resend API or similar)

### Nice-to-have improvements

- Add "Last reviewed: [date]" to review page hero
- Add `RelatedContent` component at the bottom of every review linking to: its comparison pages, its alternatives page, its pricing page
- Add "People Also Compare" sidebar widget on review pages
- Breadcrumb schema on all nested pages

---

## New tool reviews to add

Add to the `tools` record in `src/app/reviews/[slug]/page.tsx`:

| Slug | Tool | Category | Affiliate Commission |
|---|---|---|---|
| `clearscope` | Clearscope | Content | 20% recurring |
| `frase` | Frase | Content | 30% recurring |
| `brightlocal` | BrightLocal | Local SEO | 30% recurring |
| `whitespark` | Whitespark | Local SEO | Has program |
| `accuranker` | AccuRanker | Rank Tracking | 25% recurring |
| `ubersuggest` | Ubersuggest | Keyword Research | Has program |
| `keywords-everywhere` | Keywords Everywhere | Keyword Research | Has program |
| `rank-math` | Rank Math | WordPress SEO | Has program |
| `yoast` | Yoast SEO | WordPress SEO | Has program |
| `sistrix` | Sistrix | All-in-One (EU) | Has program |
| `majestic` | Majestic | Backlinks | Has program |
| `contentking` | ContentKing | Technical SEO | Has program |

---

## Affiliate programs to join

Priority order:

| Program | Commission | Why |
|---|---|---|
| Semrush | $200/sale or 40% recurring | Highest payout in the space |
| SE Ranking | 30% recurring | Lower price = easier conversion |
| Mangools | 30% recurring | Easy to recommend broadly |
| Surfer SEO | 25% recurring | Growing fast |
| Ahrefs | Has program | Must-have brand |
| Moz | Mid-tier | High brand recognition |
| BrightLocal | 30% recurring | Underserved local SEO audience |
| Clearscope / Frase | 20–30% recurring | High LTV customers |

---

## Implementation order (6-month roadmap)

### Month 1
- Build `/comparisons/[slug]` route + 6 existing stub pages — done
- Add Review schema + FAQ schema to all 8 existing review pages — done
- Fix category filter on `/reviews` — done
- Add `/affiliate-disclosure` page + link from footer — done
- Fix sitemap to enumerate all slugs — done

### Month 2
- Build `/alternatives/[slug]` route + 5 alternatives pages — done
- Build `/pricing/[slug]` route + 4 pricing pages — done
- Add 4 new tool reviews (Clearscope, BrightLocal, Yoast, Rank Math)

### Month 3
- 5 use-case pages
- 6 new comparisons
- 3 blog posts (AI search cluster)
- Email capture form integration

### Month 4
- Coupon/deal pages for top 4 tools
- 4 more tool reviews
- 6 blog posts (keyword research + technical SEO clusters)
- Tool-specific how-to posts

### Month 5
- 4 more use-case pages
- 4 more comparisons
- 6 more blog posts
- 4 more tool reviews

### Month 6
- Content refresh pass on Month 1–2 pages (pricing, new features)
- Internal linking audit
- Add `RelatedContent` component to all review pages

---

## Internal linking pattern

Every page should funnel toward a buying decision:

```
Blog post
  → Best [Category] Tools page
  → Individual tool review (best overall)
  → Tool vs Alternative comparison
  → Tool pricing page
  → Affiliate CTA
```

Each review page should link out to:
- Its head-to-head comparisons (e.g. Semrush review → Semrush vs Ahrefs)
- Its alternatives page (e.g. Semrush review → Semrush alternatives)
- Its pricing page (e.g. Semrush review → Semrush pricing)

---

## Differentiation strategy

1. **AI visibility angle** — SaySEO owns the "SEO + AI search" niche via the dashboard tool. Write editorial content from this perspective. No competitor does this.
2. **UK-first** — .co.uk domain, GBP pricing where relevant, UK market examples, coverage of EU-dominant tools (Sistrix, Majestic).
3. **Own data** — use SaySEO dashboard data to publish data-backed posts ("We analysed 100 sites — here's what AI citation leaders have in common").
4. **Honest negative reviews** — don't rate everything 4.5+. Trust converts better than uniformly positive coverage.
5. **Freshness** — show "Last reviewed" dates and actually update quarterly. Most competitor sites go stale.
