# AGENTS.md

## Project
SaySEO — an AI visibility platform for SEO professionals. Tracks how much traffic a site receives from AI tools (ChatGPT, Perplexity, Gemini, Claude, etc.) using GA4 and Google Search Console data.

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
