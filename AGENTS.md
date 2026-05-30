# AGENTS.md

## Content strategy
The full content strategy for making SaySEO a top-tier SEO affiliate site is at:
**`docs/content-strategy.md`**

Read that file before doing any affiliate-side work. It specifies:
- Which pages to build (comparisons, alternatives, pricing, deals, use-case, blog)
- Exact routes, data structures, and implementation order
- Which tools to review next and which affiliate programs to prioritise
- Technical gaps (schema, sitemap, filter interactivity) to fix

### Current implementation priority (Month 1)
1. Build `src/app/comparisons/[slug]/page.tsx` — detail pages for all 6 comparison stubs
2. Add `application/ld+json` Review schema + FAQPage schema to `src/app/reviews/[slug]/page.tsx`
3. Make category filter chips functional in `src/app/reviews/page.tsx`
4. Build `src/app/affiliate-disclosure/page.tsx` and link it in `src/components/affiliate/AffiliateFooter.tsx`
5. Update `src/app/sitemap.ts` to enumerate all review and comparison slugs dynamically

## Project
SaySEO — dual-purpose: (1) SEO affiliate marketing site with independent tool reviews, comparisons, and guides; (2) AI visibility platform dashboard for SEO professionals. Tracks how much traffic a site receives from AI tools (ChatGPT, Perplexity, Gemini, Claude, etc.) using GA4 and Google Search Console data.

## Stack
- Next.js 15 App Router
- TypeScript (strict)
- Tailwind CSS
- Supabase (auth + database + RLS)
- Google APIs (GA4 Analytics Data API v1beta, Search Console API v1)
- Anthropic SDK (claude-sonnet-4-6) for AI recommendations
- Recharts for dashboard charts

## Route groups
- `(auth)` — login, signup, auth callback
- `(dashboard)` — /dashboard/connect, /dashboard/[siteId]
- No public marketing pages; root `/` redirects to `/auth/login`

## Design principles
- Dark theme: #0A0A0A background, #00D4AA accent, #111 surface cards
- White text, subtle borders (rgba(255,255,255,0.07–0.12))
- Minimal, data-dense, professional

## Coding principles
- All GA4 int64 fields (limit, offset) must be string type, not number
- Charts loaded via next/dynamic with ssr: false (Recharts uses browser APIs)
- All API routes: check Supabase auth session, then fetch data
- Use 6h report_cache table to avoid redundant GA4/GSC API calls
- Token refresh handled automatically via googleapis OAuth2Client 'tokens' event
- isInvalidGrant() for detecting expired/revoked Google tokens → return reconnect_required
